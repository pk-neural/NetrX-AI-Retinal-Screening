"""
NetrX Vessel Analysis Service (DRIVE-based)

Uses the trained DRIVE vessel segmentation model.
Produces a binary vessel mask and coverage analysis.
"""

import cv2
import numpy as np
import torch
import base64
import logging

logger = logging.getLogger("netrx.vessel")

def _compute_fov_mask(img_bgr: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (11, 11), 0)
    _, binary = cv2.threshold(blurred, 10, 255, cv2.THRESH_BINARY)
    kernel = np.ones((7, 7), np.uint8)
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
    binary = cv2.dilate(binary, np.ones((5, 5), np.uint8), iterations=2)
    return (binary > 0).astype(np.uint8)

def _cleanup_vessel_mask(mask: np.ndarray) -> np.ndarray:
    kernel = np.ones((3, 3), np.uint8)
    opened = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(opened, connectivity=8)
    cleaned = np.zeros_like(opened)
    for i in range(1, num_labels):
        if stats[i, cv2.CC_STAT_AREA] >= 5:
            cleaned[labels == i] = 1
    return cleaned

def predict_vessels(model, input_tensor: torch.Tensor, original_bgr: np.ndarray) -> dict:
    device = next(model.parameters()).device
    original_height, original_width = original_bgr.shape[:2]
    display_size = 512

    try:
        # 1. Custom Preprocessing for DRIVE Vessel UNet
        img_rgb = cv2.cvtColor(original_bgr, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img_rgb, (512, 512))
        vessel_input = torch.from_numpy(img_resized).float().permute(2, 0, 1).unsqueeze(0) / 255.0
        vessel_input = vessel_input.to(device)

        model.eval()
        with torch.no_grad():
            output = model(vessel_input)

        if isinstance(output, dict):
            mask_tensor = output.get("out", output.get("mask", list(output.values())[0]))
        elif isinstance(output, (list, tuple)):
            mask_tensor = output[0]
        else:
            mask_tensor = output

        # 2. Extract Probability Map
        if mask_tensor.shape[1] > 1:
            prob_map = torch.softmax(mask_tensor, dim=1)[0, 1].cpu().numpy()
        else:
            prob_map = torch.sigmoid(mask_tensor).squeeze().cpu().numpy()

        # 3. Resize Probability Map to Original Dimensions (INTER_LINEAR)
        prob_resized = cv2.resize(prob_map, (original_width, original_height), interpolation=cv2.INTER_LINEAR)

        # 4. Threshold to create binary mask
        threshold = 0.5
        binary_mask = (prob_resized >= threshold).astype(np.uint8)

        # 5. Apply FOV Mask
        fov_mask = _compute_fov_mask(original_bgr)
        binary_mask = binary_mask * fov_mask

        # 6. Cleanup isolated pixels (optional refinement)
        cleaned_mask = _cleanup_vessel_mask(binary_mask)

        # 7. Calculate Coverage
        vessel_pixels = int(np.sum(cleaned_mask))
        fov_pixels = int(np.sum(fov_mask))
        coverage = (vessel_pixels / fov_pixels) * 100.0 if fov_pixels > 0 else 0.0

        logger.info(
            f"[Vessel Analysis] prob_min={prob_map.min():.4f} prob_max={prob_map.max():.4f} "
            f"prob_mean={prob_map.mean():.4f} "
            f"vessel_px={vessel_pixels} fov_px={fov_pixels} coverage={coverage:.2f}%"
        )

        # 8. Create Final Overlay (Original + Green Highlight)
        overlay = original_bgr.copy()
        
        # Color positive vessel pixels green (pure green on original)
        green = np.array([0, 255, 0], dtype=np.uint8)
        mask_bool = cleaned_mask == 1
        overlay[mask_bool] = green

        # 9. Debug Images
        import os
        artifact_dir = "/Users/pruthvi/.gemini/antigravity-ide/brain/36ca8c39-c18b-4a05-b5c5-5164653c676a"
        if os.path.exists(artifact_dir):
            cv2.imwrite(os.path.join(artifact_dir, "debug_drive_original.png"), original_bgr)
            cv2.imwrite(os.path.join(artifact_dir, "debug_drive_mask.png"), cleaned_mask * 255)
            cv2.imwrite(os.path.join(artifact_dir, "debug_drive_overlay.png"), overlay)

        # 10. Encode for Frontend
        # Resize to display_size for frontend payload to save bandwidth
        cleaned_mask_display = cv2.resize((cleaned_mask * 255).astype(np.uint8), (display_size, display_size), interpolation=cv2.INTER_NEAREST)
        overlay_display = cv2.resize(overlay, (display_size, display_size), interpolation=cv2.INTER_AREA)

        _, mask_buffer = cv2.imencode(".png", cleaned_mask_display)
        _, overlay_buffer = cv2.imencode(".jpg", overlay_display, [cv2.IMWRITE_JPEG_QUALITY, 92])

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
