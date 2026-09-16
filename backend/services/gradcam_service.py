"""
NetrX Grad-CAM Service — ViT-B/16 (From-Scratch Implementation)

Generates class-specific Grad-CAM explanations for the DR ViT-B/16 model.
Includes strict FOV masking to ensure activations do not appear outside the retina.
"""

import cv2
import numpy as np
import torch
import base64
import logging

logger = logging.getLogger("netrx.gradcam")

# ── Constants ─────────────────────────────────────────────────────────────────
EXPECTED_TOTAL_TOKENS = 197   # 1 CLS + 196 patch tokens
EXPECTED_PATCH_TOKENS = 196   # 14 × 14
EXPECTED_PATCH_GRID   = 14    # sqrt(196)
EXPECTED_FEATURE_DIM  = 768   # ViT-B hidden dim
OUTPUT_SIZE           = 512   # Final PNG resolution sent to frontend


def generate_gradcam(
    model,
    input_tensor: torch.Tensor,
    original_bgr: np.ndarray,
    target_class: int = None,
) -> dict:
    """
    Generate a class-specific Grad-CAM overlay for the DR ViT-B/16 model.

    Args:
        model:         Loaded DR ViT-B/16 model
        input_tensor:  Preprocessed input tensor, shape [1, 3, 224, 224]
        original_bgr:  Original fundus image in BGR (for overlay)
        target_class:  DR grade to explain (should be the predicted class)

    Returns:
        dict with "gradcam_image" and "heatmap_image" base64 strings.
    """
    try:
        device = next(model.parameters()).device
        H_orig, W_orig = original_bgr.shape[:2]

        # ── GENERATE RETINAL FOV MASK ─────────────────────────────────────────
        gray = cv2.cvtColor(original_bgr, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 15, 255, cv2.THRESH_BINARY)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        mask_cleaned = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
        mask_cleaned = cv2.morphologyEx(mask_cleaned, cv2.MORPH_CLOSE, kernel)
        
        contours, _ = cv2.findContours(mask_cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            fov_mask_orig = np.zeros_like(gray, dtype=np.float32)
            cv2.drawContours(fov_mask_orig, [largest_contour], -1, 1.0, thickness=cv2.FILLED)
        else:
            fov_mask_orig = np.ones_like(gray, dtype=np.float32)
            
        fov_coverage = (np.count_nonzero(fov_mask_orig) / fov_mask_orig.size) * 100.0
        
        # Soft FOV for final full-res masking
        fov_soft = cv2.GaussianBlur(fov_mask_orig, (0, 0), sigmaX=2)
        
        # 14x14 FOV for patch-level masking
        fov_mask_14 = cv2.resize(fov_mask_orig, (EXPECTED_PATCH_GRID, EXPECTED_PATCH_GRID), interpolation=cv2.INTER_AREA)

        # ── Hook setup ────────────────────────────────────────────────────────
        captured = {"activations": None, "gradients": None}

        def forward_hook(module, input, output):
            captured["activations"] = output

        def backward_hook(module, grad_input, grad_output):
            captured["gradients"] = grad_output[0]

        target_layer = model.encoder.layers[-1].ln_1
        fwd_handle = target_layer.register_forward_hook(forward_hook)
        bwd_handle = target_layer.register_full_backward_hook(backward_hook)

        try:
            # ── Forward pass ──────────────────────────────────────────────────
            model.eval()
            input_t = input_tensor.to(device).requires_grad_(False)
            logits = model(input_t)
            probs = torch.softmax(logits, dim=1)[0].detach().cpu().numpy()

            predicted_class = int(np.argmax(probs))
            grad_target = target_class if target_class is not None else predicted_class
            predicted_confidence = float(probs[predicted_class]) * 100.0

            # ── Backward pass ─────────────────────────────────────────────────
            model.zero_grad()
            target_score = logits[0, grad_target]
            target_score.backward()

            activations = captured["activations"]
            gradients = captured["gradients"]

            # ── Validate shapes ───────────────────────────────────────────────
            assert activations.shape[1] == EXPECTED_TOTAL_TOKENS, "Expected 197 tokens"
            assert gradients.shape[1] == EXPECTED_TOTAL_TOKENS, "Expected 197 gradient tokens"
            assert grad_target == predicted_class, "Grad-CAM target must match predicted class"

            act = activations[0].detach().cpu()
            grad = gradients[0].detach().cpu()

            # Remove CLS token
            act_patches = act[1:]    # [196, 768]
            grad_patches = grad[1:]  # [196, 768]

            assert act_patches.shape[0] == EXPECTED_PATCH_TOKENS, "Expected 196 patch tokens"
            assert grad_patches.shape[0] == EXPECTED_PATCH_TOKENS, "Expected 196 gradient tokens"

            # ── Compute Grad-CAM ──────────────────────────────────────────────
            weights = grad_patches.mean(dim=0)
            cam = (act_patches * weights.unsqueeze(0)).sum(dim=1)
            cam_2d = cam.reshape(EXPECTED_PATCH_GRID, EXPECTED_PATCH_GRID)

            # ReLU for positive evidence only
            cam_2d = torch.relu(cam_2d)
            cam_np = cam_2d.numpy().astype(np.float32)
            
            # Apply 14x14 FOV mask BEFORE normalization to avoid normalizing noise
            cam_np = cam_np * fov_mask_14

            # Stable Normalization
            cam_min = cam_np.min()
            cam_max = cam_np.max()
            if cam_max > cam_min:
                cam_np = (cam_np - cam_min) / (cam_max - cam_min + 1e-8)
            else:
                cam_np = np.zeros_like(cam_np)

            # Remove tiny numerical noise
            cam_np[cam_np < 0.02] = 0

        finally:
            fwd_handle.remove()
            bwd_handle.remove()

        # ── Upsample to 224x224 (Bilinear) ────────────────────────────────────
        cam_resized = cv2.resize(cam_np, (W_orig, H_orig), interpolation=cv2.INTER_LINEAR)
        
        # Apply full-res soft FOV mask to cleanly cut off background
        cam_resized = cam_resized * fov_soft
        
        # Mild Gaussian smoothing (sigma=2) for visual quality
        cam_resized = cv2.GaussianBlur(cam_resized, (0, 0), sigmaX=2)
        cam_resized = np.clip(cam_resized, 0, 1).astype(np.float32)
        
        c_min, c_max, c_mean = cam_resized.min(), cam_resized.max(), cam_resized.mean()

        # ── Visualization ─────────────────────────────────────────────────────
        heatmap_u8 = np.uint8(cam_resized * 255)
        heatmap_bgr = cv2.applyColorMap(heatmap_u8, cv2.COLORMAP_JET)

        orig_float = original_bgr.astype(np.float32) / 255.0
        heat_float = heatmap_bgr.astype(np.float32) / 255.0

        # Alpha = 0 outside FOV, max 0.45 inside
        alpha = (0.45 * cam_resized)[..., np.newaxis]
        overlay_float = (1.0 - alpha) * orig_float + alpha * heat_float
        overlay_bgr = np.clip(overlay_float * 255, 0, 255).astype(np.uint8)

        # ── Detailed Logging ──────────────────────────────────────────────────
        logger.info(
            f"\n{'=' * 50}\n"
            f"NETRX GRAD-CAM VALIDATION\n"
            f"{'=' * 50}\n"
            f"Predicted DR Grade : {predicted_class}\n"
            f"Target Class       : {grad_target}\n"
            f"Model Confidence   : {predicted_confidence:.2f}%\n\n"
            f"Activation Shape   : {tuple(activations.shape)}\n"
            f"Gradient Shape     : {tuple(gradients.shape)}\n\n"
            f"Total Tokens       : {EXPECTED_TOTAL_TOKENS}\n"
            f"Patch Tokens       : {EXPECTED_PATCH_TOKENS}\n"
            f"Patch Grid         : {EXPECTED_PATCH_GRID} x {EXPECTED_PATCH_GRID}\n\n"
            f"CAM Before FOV     : {EXPECTED_PATCH_GRID} x {EXPECTED_PATCH_GRID}\n"
            f"FOV Mask Shape     : {tuple(fov_mask_orig.shape)}\n"
            f"CAM After FOV      : {EXPECTED_PATCH_GRID} x {EXPECTED_PATCH_GRID}\n"
            f"CAM Final Shape    : {W_orig} x {H_orig}\n\n"
            f"CAM Min            : {c_min:.6f}\n"
            f"CAM Max            : {c_max:.6f}\n"
            f"CAM Mean           : {c_mean:.6f}\n\n"
            f"FOV Coverage       : {fov_coverage:.2f}%\n"
            f"{'=' * 50}"
        )

        # ── Output Encoding ───────────────────────────────────────────────────
        overlay_out = cv2.resize(overlay_bgr, (OUTPUT_SIZE, OUTPUT_SIZE), interpolation=cv2.INTER_AREA)
        heatmap_out = cv2.resize(heatmap_bgr, (OUTPUT_SIZE, OUTPUT_SIZE), interpolation=cv2.INTER_AREA)

        _, overlay_buf = cv2.imencode(".png", overlay_out)
        _, heatmap_buf = cv2.imencode(".png", heatmap_out)

        return {
            "gradcam_image": base64.b64encode(overlay_buf).decode("utf-8"),
            "heatmap_image": base64.b64encode(heatmap_buf).decode("utf-8"),
        }

    except Exception as e:
        logger.error(f"[GradCAM] Generation failed: {e}", exc_info=True)
        fallback = cv2.resize(original_bgr, (OUTPUT_SIZE, OUTPUT_SIZE))
        _, buf = cv2.imencode(".png", fallback)
        fb64 = base64.b64encode(buf).decode("utf-8")
        return {"gradcam_image": fb64, "heatmap_image": fb64}
