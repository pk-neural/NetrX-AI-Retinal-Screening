"""
NetrX Preprocessing Service

Implements the validated preprocessing pipeline:
  Original → Median noise reduction → CLAHE enhancement → Resize 224×224 → ImageNet normalization

Parameters are fixed and must not be changed:
  IMG_SIZE = 224
  Median filter: (3, 3, 1)
  CLAHE: clipLimit=2.0, tileGridSize=(8,8)
  Resize interpolation: INTER_AREA
  ImageNet mean: [0.485, 0.456, 0.406]
  ImageNet std: [0.229, 0.224, 0.225]
"""

import cv2
import numpy as np
from PIL import Image
import io
import base64
import torch
from torchvision import transforms

# ── Fixed parameters (do not change) ──────────────────────────
IMG_SIZE = 224
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]
MEDIAN_KERNEL = 3  # cv2.medianBlur uses single int for ksize
CLAHE_CLIP_LIMIT = 2.0
CLAHE_TILE_GRID = (8, 8)


def decode_image_bytes(image_bytes: bytes) -> np.ndarray:
    """Decode raw image bytes to BGR numpy array (OpenCV format)."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image. File may be corrupted or unsupported.")
    return img


def apply_median_filter(img_bgr: np.ndarray) -> np.ndarray:
    """Apply median noise reduction filter."""
    # Apply median filter per-channel to match (3,3,1) specification
    channels = cv2.split(img_bgr)
    filtered = [cv2.medianBlur(ch, MEDIAN_KERNEL) for ch in channels]
    return cv2.merge(filtered)


def apply_clahe(img_bgr: np.ndarray) -> np.ndarray:
    """Apply Controlled CLAHE enhancement on L channel of LAB color space."""
    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)

    clahe = cv2.createCLAHE(clipLimit=CLAHE_CLIP_LIMIT, tileGridSize=CLAHE_TILE_GRID)
    l_enhanced = clahe.apply(l_channel)

    lab_enhanced = cv2.merge([l_enhanced, a_channel, b_channel])
    return cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2BGR)


def resize_image(img_bgr: np.ndarray, size: int = IMG_SIZE) -> np.ndarray:
    """Resize to IMG_SIZE × IMG_SIZE using INTER_AREA interpolation."""
    return cv2.resize(img_bgr, (size, size), interpolation=cv2.INTER_AREA)


def to_model_tensor(img_bgr: np.ndarray) -> torch.Tensor:
    """Convert preprocessed BGR image to ImageNet-normalized tensor for model input."""
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(img_rgb)

    transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])

    return transform(pil_img).unsqueeze(0)  # Add batch dimension


def numpy_to_base64(img_bgr: np.ndarray, fmt: str = ".jpg") -> str:
    """Convert BGR numpy array to base64-encoded string."""
    success, buffer = cv2.imencode(fmt, img_bgr)
    if not success:
        raise ValueError("Failed to encode image")
    return base64.b64encode(buffer).decode("utf-8")


def preprocess_pipeline(image_bytes: bytes) -> dict:
    """
    Run the full validated preprocessing pipeline.

    Returns dict with:
      - original_bgr: original image as numpy array
      - denoised_bgr: after median filter
      - enhanced_bgr: after CLAHE
      - resized_bgr: after resize to 224×224
      - model_tensor: ready for model input
      - original_b64: base64 of original (for frontend display)
      - enhanced_b64: base64 of enhanced (for frontend display)
    """
    # 1. Decode
    original_bgr = decode_image_bytes(image_bytes)
    original_h, original_w = original_bgr.shape[:2]

    # 2. Median noise reduction
    denoised_bgr = apply_median_filter(original_bgr)

    # 3. CLAHE enhancement
    enhanced_bgr = apply_clahe(denoised_bgr)

    # 4. Resize to 224×224
    resized_bgr = resize_image(enhanced_bgr, IMG_SIZE)

    # 5. Create model input tensor (ImageNet normalized)
    model_tensor = to_model_tensor(enhanced_bgr)

    # 6. Create display-size images for frontend
    display_size = 512
    original_display = cv2.resize(original_bgr, (display_size, display_size), interpolation=cv2.INTER_AREA)
    enhanced_display = cv2.resize(enhanced_bgr, (display_size, display_size), interpolation=cv2.INTER_AREA)

    return {
        "original_bgr": original_bgr,
        "denoised_bgr": denoised_bgr,
        "enhanced_bgr": enhanced_bgr,
        "resized_bgr": resized_bgr,
        "model_tensor": model_tensor,
        "original_b64": numpy_to_base64(original_display),
        "enhanced_b64": numpy_to_base64(enhanced_display),
        "original_width": original_w,
        "original_height": original_h,
        "model_input_size": [IMG_SIZE, IMG_SIZE],
    }
