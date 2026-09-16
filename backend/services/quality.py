"""
NetrX Quality Assessment Service

Multi-feature quality assessment using:
  1. Focus (Laplacian variance + Tenengrad energy)
  2. Illumination (mean intensity within FOV)
  3. Contrast (std dev within FOV)
  4. Retinal Detail (Canny edge density within FOV)
  5. Field of View (retinal area coverage)

Composite score with hard-fail conditions.
"""

import cv2
import numpy as np


def netrx_quality_score(image):

    # --------------------------------------------------------
    # GRAYSCALE
    # --------------------------------------------------------
    # Assuming input is BGR as per the assess_quality usage in main.py
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # --------------------------------------------------------
    # 1. FIELD OF VIEW (Compute this FIRST to use for masking)
    # --------------------------------------------------------
    blurred = cv2.GaussianBlur(gray, (11, 11), 0)
    _, fov_binary = cv2.threshold(blurred, 10, 255, cv2.THRESH_BINARY)
    kernel = np.ones((7, 7), np.uint8)
    fov_binary = cv2.morphologyEx(fov_binary, cv2.MORPH_CLOSE, kernel)
    fov_binary = cv2.morphologyEx(fov_binary, cv2.MORPH_OPEN, kernel)

    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(fov_binary, connectivity=8)

    if num_labels > 1:
        largest_idx = np.argmax(stats[1:, cv2.CC_STAT_AREA]) + 1
        fov_area = stats[largest_idx, cv2.CC_STAT_AREA]
        fov_mask = (labels == largest_idx).astype(np.uint8)
        total_area = gray.shape[0] * gray.shape[1]
        fov_ratio = fov_area / total_area
        fov_score = np.clip(fov_ratio * 100, 0, 100)
    else:
        fov_mask = np.zeros_like(gray)
        fov_area = 0
        fov_ratio = 0.0
        fov_score = 0.0
        
    valid_pixels = gray[fov_mask == 1] if fov_ratio > 0 else gray

    # --------------------------------------------------------
    # 2. FOCUS (Laplacian + Tenengrad)
    # --------------------------------------------------------
    laplacian_raw = cv2.Laplacian(gray, cv2.CV_64F).var()
    sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    tenengrad_raw = np.mean(sobelx**2 + sobely**2)

    focus_lap = np.clip(100.0 * (laplacian_raw - 0.5) / (100.0 - 0.5), 0, 100)
    focus_ten = np.clip(100.0 * (tenengrad_raw - 50.0) / (800.0 - 50.0), 0, 100)
    focus_score = (0.5 * focus_lap) + (0.5 * focus_ten)

    # --------------------------------------------------------
    # 3. ILLUMINATION (within FOV)
    # --------------------------------------------------------
    mean_intensity = float(np.mean(valid_pixels))
    dark_ratio = float(np.mean(valid_pixels < 25))
    bright_ratio = float(np.mean(valid_pixels > 220))
    illumination_score = np.clip(100.0 - (dark_ratio * 300.0) - (bright_ratio * 300.0), 0, 100)

    # --------------------------------------------------------
    # 4. CONTRAST (Std Dev within FOV)
    # --------------------------------------------------------
    contrast_raw = float(np.std(valid_pixels))
    contrast_score = np.clip(100.0 * (contrast_raw - 5.0) / (25.0 - 5.0), 0, 100)

    # --------------------------------------------------------
    # 5. RETINAL DETAIL (Edge Density within FOV)
    # --------------------------------------------------------
    edges = cv2.Canny(gray, 50, 150)
    if fov_ratio > 0:
        edge_pixels_in_fov = np.sum((edges == 255) & (fov_mask == 1))
        edge_density_raw = edge_pixels_in_fov / fov_area
    else:
        edge_density_raw = 0.0
        
    detail_score = np.clip(100.0 * (edge_density_raw - 0.0005) / (0.015 - 0.0005), 0, 100)
    
    # FOV Normalized Score
    fov_score_norm = np.clip(100.0 * (fov_ratio - 0.30) / (0.70 - 0.30), 0, 100)

    # --------------------------------------------------------
    # COMPOSITE SCORE & DECISION LOGIC
    # --------------------------------------------------------
    overall_score = (
        0.35 * focus_score +
        0.20 * detail_score +
        0.15 * contrast_score +
        0.15 * illumination_score +
        0.15 * fov_score_norm
    )

    severe_blur = focus_lap < 5.0 and focus_ten < 5.0 and detail_score < 5.0
    severe_darkness = illumination_score < 10.0 and mean_intensity < 25.0
    severe_overexposure = illumination_score < 10.0 and mean_intensity > 220.0
    insufficient_fov = fov_score_norm < 10.0
    
    if severe_blur:
        status, reason = "UNGRADABLE", "REJECTED — Severe Blur"
    elif severe_darkness:
        status, reason = "UNGRADABLE", "REJECTED — Severe Darkness"
    elif severe_overexposure:
        status, reason = "UNGRADABLE", "REJECTED — Severe Overexposure"
    elif insufficient_fov:
        status, reason = "UNGRADABLE", "REJECTED — Insufficient FOV"
    else:
        if overall_score >= 45.0:
            status, reason = "ACCEPTED", "ACCEPTED — Sufficient retinal information"
        elif overall_score >= 35.0:
            status, reason = "BORDERLINE", "BORDERLINE — Questionable quality"
        else:
            status, reason = "UNGRADABLE", "REJECTED — Overall quality too low"

    return {
        "focus_raw": float(laplacian_raw),
        "tenengrad_raw": float(tenengrad_raw),
        "contrast_raw": float(contrast_raw),
        "edge_density_raw": float(edge_density_raw),
        "focus": float(focus_score),
        "illumination": float(illumination_score),
        "contrast": float(contrast_score),
        "detail": float(detail_score),
        "fov": float(fov_score_norm),
        "overall": float(overall_score),
        "status": status,
        "reason": reason,
        "checks": {
            "severe_blur": bool(severe_blur),
            "severe_illumination": bool(severe_darkness or severe_overexposure),
            "severe_fov": bool(insufficient_fov)
        }
    }

def assess_quality(original_bgr: np.ndarray, enhanced_bgr: np.ndarray) -> dict:
    """
    Run full quality assessment on both original and enhanced images.

    Returns a dict with original metrics, enhanced metrics, changes, and final status.
    """
    orig_quality = netrx_quality_score(original_bgr)
    enh_quality = netrx_quality_score(enhanced_bgr)

    return {
        "status": orig_quality["status"],  # Final decision MUST be based on original image
        "original": orig_quality,
        "enhanced": enh_quality,
        "change": {
            "focus": round(enh_quality["focus"] - orig_quality["focus"], 2),
            "illumination": round(enh_quality["illumination"] - orig_quality["illumination"], 2),
            "contrast": round(enh_quality["contrast"] - orig_quality["contrast"], 2),
            "detail": round(enh_quality["detail"] - orig_quality["detail"], 2),
            "fov": round(enh_quality["fov"] - orig_quality["fov"], 2),
            "overall": round(enh_quality["overall"] - orig_quality["overall"], 2),
        },
    }
