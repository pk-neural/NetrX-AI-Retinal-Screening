"""
NetrX Grad-CAM Service — ViT-B/16

Generates Grad-CAM heatmap overlays from the DR ViT model.
Falls back to EigenCAM when gradients vanish (very confident model).
Applies top-5% threshold so only the SINGLE MOST INFLUENTIAL region is shown.
"""

import cv2
import numpy as np
import torch
import base64
import logging
import os

from pytorch_grad_cam import GradCAM, EigenCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

logger = logging.getLogger("netrx.gradcam")

ARTIFACT_DIR = "/Users/pruthvi/.gemini/antigravity-ide/brain/36ca8c39-c18b-4a05-b5c5-5164653c676a"


# ─── helpers ──────────────────────────────────────────────────────────────────

def _compute_fov_mask(img_bgr: np.ndarray) -> np.ndarray:
    """Binary FOV mask for the circular fundus region."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (11, 11), 0)
    _, binary = cv2.threshold(blurred, 10, 255, cv2.THRESH_BINARY)
    kernel = np.ones((7, 7), np.uint8)
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
    binary = cv2.dilate(binary, np.ones((5, 5), np.uint8), iterations=2)
    return (binary > 0).astype(np.float32)


def reshape_transform(tensor):
    """ViT reshape: drop CLS token → [B, 14, 14, C] → [B, C, 14, 14]."""
    tensor = tensor[:, 1:, :]
    tensor = tensor.reshape(tensor.size(0), 14, 14, tensor.size(2))
    tensor = tensor.permute(0, 3, 1, 2)
    return tensor


# ─── main ─────────────────────────────────────────────────────────────────────

def generate_gradcam(
    model,
    input_tensor: torch.Tensor,
    original_bgr: np.ndarray,
    target_class: int = None,
) -> dict:
    """
    Generate a localized Grad-CAM overlay showing ONLY the most influential region.

    Pipeline:
      1. Run GradCAM.  If gradients vanish → fall back to EigenCAM.
      2. Resize to original image dimensions.
      3. Apply circular FOV mask.
      4. Zero-out everything below the 95th percentile inside the FOV
         (keep only the top 5% of activations).
      5. Gaussian-smooth the surviving hot region.
      6. Blend with alpha proportional to activation strength (max 0.70).
      7. Return base64-encoded overlay PNG.
    """
    try:
        device = next(model.parameters()).device
        model.eval()

        # ── 1a. Get predicted class ───────────────────────────────────────────
        with torch.no_grad():
            logits = model(input_tensor.to(device))
            probs = torch.softmax(logits, dim=1)[0].cpu().numpy()

        predicted_grade = int(np.argmax(probs)) if target_class is None else target_class
        predicted_prob = float(probs[predicted_grade])
        logger.info(f"[GradCAM] class={predicted_grade} prob={predicted_prob:.3f}")

        target_layer = model.encoder.layers[-1].ln_1
        targets = [ClassifierOutputTarget(predicted_grade)]

        # ── 1b. GradCAM → EigenCAM fallback ──────────────────────────────────
        grayscale_cam = None
        method_used = "GradCAM"

        try:
            cam_obj = GradCAM(
                model=model,
                target_layers=[target_layer],
                reshape_transform=reshape_transform,
            )
            raw = cam_obj(input_tensor=input_tensor.to(device), targets=targets)[0]
            span = float(raw.max()) - float(raw.min())
            if span < 1e-4:
                raise ValueError(f"GradCAM near-zero (span={span:.2e}) — gradients vanished")
            grayscale_cam = raw
            logger.info(f"[GradCAM] GradCAM ok: min={raw.min():.4f} max={raw.max():.4f}")
        except Exception as ge:
            logger.warning(f"[GradCAM] {ge} → switching to EigenCAM")
            method_used = "EigenCAM"
            eigen_obj = EigenCAM(
                model=model,
                target_layers=[target_layer],
                reshape_transform=reshape_transform,
            )
            grayscale_cam = eigen_obj(input_tensor=input_tensor.to(device), targets=targets)[0]
            logger.info(f"[GradCAM] EigenCAM: min={grayscale_cam.min():.4f} max={grayscale_cam.max():.4f}")

        # ── 2. Resize to original image ───────────────────────────────────────
        H, W = original_bgr.shape[:2]
        cam_resized = cv2.resize(grayscale_cam, (W, H), interpolation=cv2.INTER_CUBIC)
        cam_resized = np.clip(cam_resized, 0, 1).astype(np.float32)

        # ── 3. FOV mask ───────────────────────────────────────────────────────
        fov_mask = _compute_fov_mask(original_bgr)
        cam_resized *= fov_mask

        # ── 4. Keep ONLY the top 5% of activations inside FOV ────────────────
        valid_vals = cam_resized[fov_mask > 0]
        if valid_vals.size > 0 and valid_vals.max() > valid_vals.min():
            thresh = np.percentile(valid_vals, 95)
        else:
            thresh = 0.0

        cam_filtered = np.where(cam_resized >= thresh, cam_resized, 0.0).astype(np.float32)
        cam_filtered *= fov_mask

        # Renormalize so the peak = 1.0
        peak = cam_filtered.max()
        if peak > 0:
            cam_filtered /= peak

        # ── 5. Smooth only the surviving hot region ───────────────────────────
        cam_filtered = cv2.GaussianBlur(cam_filtered, (0, 0), sigmaX=8)
        cam_filtered *= fov_mask
        peak2 = cam_filtered.max()
        if peak2 > 0:
            cam_filtered /= peak2

        active_px = int((cam_filtered > 0.01).sum())
        logger.info(f"[GradCAM] method={method_used} thresh={thresh:.4f} active_px={active_px}")

        # ── 6. JET heatmap ────────────────────────────────────────────────────
        heatmap_u8 = np.uint8(cam_filtered * 255)
        heatmap_bgr_jet = cv2.applyColorMap(heatmap_u8, cv2.COLORMAP_JET)
        heatmap_rgb_jet = cv2.cvtColor(heatmap_bgr_jet, cv2.COLOR_BGR2RGB)

        # ── 7. Alpha blend — max 0.70, zero outside hot region ───────────────
        orig_rgb = cv2.cvtColor(original_bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
        heat_f = heatmap_rgb_jet.astype(np.float32) / 255.0

        alpha = (0.70 * cam_filtered)[..., np.newaxis]          # [H,W,1]
        overlay_f = (1.0 - alpha) * orig_rgb + alpha * heat_f
        overlay_f[fov_mask == 0] = orig_rgb[fov_mask == 0]      # restore black background

        overlay_u8 = np.clip(overlay_f * 255, 0, 255).astype(np.uint8)
        overlay_bgr = cv2.cvtColor(overlay_u8, cv2.COLOR_RGB2BGR)
        heatmap_bgr_out = cv2.cvtColor(heatmap_rgb_jet, cv2.COLOR_RGB2BGR)

        # ── 8. Save debug artifacts ───────────────────────────────────────────
        if os.path.exists(ARTIFACT_DIR):
            cv2.imwrite(os.path.join(ARTIFACT_DIR, "gradcam_original.png"), original_bgr)
            cv2.imwrite(os.path.join(ARTIFACT_DIR, "gradcam_activation.png"), heatmap_bgr_out)
            cv2.imwrite(os.path.join(ARTIFACT_DIR, "gradcam_final_overlay.png"), overlay_bgr)

        # ── 9. Encode for frontend ────────────────────────────────────────────
        SZ = 512
        _, ob = cv2.imencode(".png", cv2.resize(overlay_bgr, (SZ, SZ), interpolation=cv2.INTER_AREA))
        _, hb = cv2.imencode(".png", cv2.resize(heatmap_bgr_out, (SZ, SZ), interpolation=cv2.INTER_AREA))

        return {
            "gradcam_image": base64.b64encode(ob).decode("utf-8"),
            "heatmap_image": base64.b64encode(hb).decode("utf-8"),
        }

    except Exception as e:
        logger.error(f"[GradCAM] Generation failed: {e}", exc_info=True)
        SZ = 512
        _, buf = cv2.imencode(".png", cv2.resize(original_bgr, (SZ, SZ)))
        fb = base64.b64encode(buf).decode("utf-8")
        return {"gradcam_image": fb, "heatmap_image": fb}
