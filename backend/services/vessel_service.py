"""
NetrX Vessel Analysis Service (DRIVE-based)

Uses the trained DRIVE vessel segmentation model (custom UNet).
Produces a binary vessel mask, probability-weighted overlay, and coverage analysis.

Pipeline:
  Original Fundus → Model preprocessing → DRIVE UNet → sigmoid(logits) →
  threshold → FOV mask → minimal cleanup → overlay on original fundus

The model outputs raw logits (not probabilities).
Sigmoid is applied exactly once to convert to probabilities.
"""

import cv2
import numpy as np
import torch
import base64
import logging

logger = logging.getLogger("netrx.vessel")

# ── Validated threshold ───────────────────────────────────────────────────────
# Diagnostic testing showed:
#   - Model outputs raw logits; sigmoid converts to probabilities
#   - Probability distribution is compressed: most values cluster around 0.2–0.3
#   - At thresh=0.50: only 0.52% coverage (too sparse, thin vessels lost)
#   - At thresh=0.30: 6.34% coverage on real fundus (within expected 5–15% range)
#   - Safety: if thresh=0.30 produces >30% coverage, the model's probability
#     distribution is too flat for this image → use percentile-based fallback
BASE_THRESHOLD = 0.30
MAX_REASONABLE_COVERAGE = 30.0  # If >30%, threshold is too permissive
FALLBACK_PERCENTILE = 90        # Use P90 of FOV probabilities as fallback
MIN_COMPONENT_AREA = 10         # Remove isolated noise < 10 px


def _compute_fov_mask(img_bgr: np.ndarray) -> np.ndarray:
    """Detect retinal field-of-view from the original fundus image."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (11, 11), 0)
    _, binary = cv2.threshold(blurred, 10, 255, cv2.THRESH_BINARY)
    kernel = np.ones((7, 7), np.uint8)
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
    # Erode to remove edge artifacts (noisy dotted ring around the FOV)
    erode_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    binary = cv2.erode(binary, erode_kernel, iterations=1)
    return (binary > 0).astype(np.uint8)


def _cleanup_vessel_mask(mask: np.ndarray, fov_mask: np.ndarray) -> np.ndarray:
    """
    Remove tiny isolated noise pixels and boundary artifacts.
    Identifies components that lie almost entirely on the FOV boundary
    and removes them without harming genuine vessels that just touch the boundary.
    """
    # 1. Compute boundary region (pixels close to the FOV edge)
    dist_map = cv2.distanceTransform(fov_mask, cv2.DIST_L2, 5)
    max_dist = max(fov_mask.shape)
    boundary_thickness = max_dist * 0.04 # 4% of image size
    boundary_region = (dist_map < boundary_thickness).astype(np.uint8) * fov_mask

    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    cleaned = np.zeros_like(mask)
    
    for i in range(1, num_labels):
        comp_mask = (labels == i).astype(np.uint8)
        area = stats[i, cv2.CC_STAT_AREA]
        
        # Remove tiny noise
        if area < MIN_COMPONENT_AREA:
            continue
            
        # Check percentage of component in the boundary region
        pixels_in_boundary = np.sum(comp_mask * boundary_region)
        boundary_ratio = pixels_in_boundary / float(area)
        
        # If component is overwhelmingly on the boundary rim, it's a false positive artifact
        if boundary_ratio > 0.8:
            continue
            
        cleaned[comp_mask == 1] = 1
        
    return cleaned


def predict_vessels(model, input_tensor: torch.Tensor, original_bgr: np.ndarray) -> dict:
    """
    Run DRIVE vessel segmentation and return overlay + mask + coverage.

    Args:
        model:         Loaded VesselUNet model
        input_tensor:  (unused — we preprocess from original_bgr directly for alignment)
        original_bgr:  Original fundus image in BGR

    Returns:
        dict with status, coverage, mask (base64 PNG), overlay (base64 PNG)
    """
    device = next(model.parameters()).device
    original_height, original_width = original_bgr.shape[:2]

    try:
        # ── 1. Preprocessing for DRIVE UNet (512×512 input) ───────────────
        img_rgb = cv2.cvtColor(original_bgr, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img_rgb, (512, 512))
        vessel_input = torch.from_numpy(img_resized).float().permute(2, 0, 1).unsqueeze(0) / 255.0
        vessel_input = vessel_input.to(device)

        # ── 2. Model Inference ────────────────────────────────────────────
        model.eval()
        with torch.no_grad():
            output = model(vessel_input)

        if isinstance(output, dict):
            mask_tensor = output.get("out", output.get("mask", list(output.values())[0]))
        elif isinstance(output, (list, tuple)):
            mask_tensor = output[0]
        else:
            mask_tensor = output

        # ── 3. Sigmoid (exactly once — model outputs raw logits) ──────────
        prob_map_512 = torch.sigmoid(mask_tensor).squeeze().cpu().numpy()

        # ── 4. Resize probability map to original dimensions ──────────────
        prob_map = cv2.resize(prob_map_512, (original_width, original_height),
                              interpolation=cv2.INTER_LINEAR)

        # ── 5. Probability statistics (before thresholding) ───────────────
        fov_mask = _compute_fov_mask(original_bgr)
        fov_pixels = int(np.sum(fov_mask))

        fov_probs = prob_map[fov_mask == 1] if fov_pixels > 0 else prob_map.flatten()
        p_min = float(fov_probs.min())
        p_max = float(fov_probs.max())
        p_mean = float(fov_probs.mean())
        p_median = float(np.median(fov_probs))
        p_95 = float(np.percentile(fov_probs, 95))

        # ── 6. Adaptive thresholding ──────────────────────────────────────
        threshold = BASE_THRESHOLD
        binary_mask = (prob_map >= threshold).astype(np.uint8) * fov_mask
        candidate_coverage = (np.sum(binary_mask) / max(fov_pixels, 1)) * 100.0

        # Safety check: if coverage is unreasonably high, the probability
        # distribution is too flat at this threshold → use percentile fallback
        if candidate_coverage > MAX_REASONABLE_COVERAGE and fov_pixels > 0:
            threshold = float(np.percentile(fov_probs, FALLBACK_PERCENTILE))
            binary_mask = (prob_map >= threshold).astype(np.uint8) * fov_mask

        # ── 7. Minimal cleanup (remove isolated noise and boundary artifacts)
        cleaned_mask = _cleanup_vessel_mask(binary_mask, fov_mask)

        # ── 8. Vessel coverage from ACTUAL predicted mask ─────────────────
        vessel_pixels = int(np.sum(cleaned_mask))
        coverage = (vessel_pixels / max(fov_pixels, 1)) * 100.0

        # ── 9. Detailed logging ───────────────────────────────────────────
        logger.info(
            f"\n{'=' * 50}\n"
            f"NETRX DRIVE VESSEL VALIDATION\n"
            f"{'=' * 50}\n"
            f"Input Shape              : {original_height} x {original_width}\n"
            f"Model Input Shape        : 512 x 512\n\n"
            f"Probability Min          : {p_min:.4f}\n"
            f"Probability Max          : {p_max:.4f}\n"
            f"Probability Mean         : {p_mean:.4f}\n"
            f"Probability Median       : {p_median:.4f}\n"
            f"Probability P95          : {p_95:.4f}\n\n"
            f"Threshold                : {threshold:.4f}\n"
            f"Valid FOV Pixels          : {fov_pixels}\n"
            f"Predicted Vessel Pixels   : {vessel_pixels}\n"
            f"Vessel Coverage           : {coverage:.2f}%\n\n"
            f"Output Mask Shape         : {original_height} x {original_width}\n"
            f"Output Image Shape        : {original_height} x {original_width}\n"
            f"{'=' * 50}"
        )

        # ── 10. Create vessel overlay on COMPLETE original fundus ─────────
        overlay = original_bgr.copy().astype(np.float32)
        mask_bool = cleaned_mask == 1

        # Green highlight blended at ~0.6 strength on vessel pixels
        vessel_color = np.array([0, 255, 0], dtype=np.float32)  # Green in BGR
        alpha = 0.6
        overlay[mask_bool] = (1.0 - alpha) * overlay[mask_bool] + alpha * vessel_color
        overlay = np.clip(overlay, 0, 255).astype(np.uint8)

        # ── 11. Encode FULL images for frontend (no cropping) ─────────────
        # Encode at original resolution (capped at 1024 for bandwidth)
        max_dim = max(original_height, original_width)
        if max_dim > 1024:
            scale = 1024.0 / max_dim
            enc_w = int(original_width * scale)
            enc_h = int(original_height * scale)
        else:
            enc_w, enc_h = original_width, original_height

        mask_display = cv2.resize((cleaned_mask * 255).astype(np.uint8),
                                  (enc_w, enc_h), interpolation=cv2.INTER_NEAREST)
        overlay_display = cv2.resize(overlay, (enc_w, enc_h), interpolation=cv2.INTER_AREA)

        _, mask_buffer = cv2.imencode(".png", mask_display)
        _, overlay_buffer = cv2.imencode(".png", overlay_display)

        return {
            "status": "completed",
            "coverage": round(float(coverage), 2),
            "mask": base64.b64encode(mask_buffer).decode("utf-8"),
            "overlay": base64.b64encode(overlay_buffer).decode("utf-8"),
        }

    except Exception as e:
        logger.error(f"Vessel analysis failed: {e}", exc_info=True)
        return {
            "status": "unavailable",
            "coverage": 0.0,
            "mask": None,
            "overlay": None,
            "error": str(e),
        }
