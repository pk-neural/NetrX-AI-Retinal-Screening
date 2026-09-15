"""
NetrX Quality Assessment Service

Calculates validated quality metrics:
  1. Focus (Laplacian variance)
  2. Illumination (mean brightness + dark/bright penalty)
  3. Field of View (retinal circle detection)
  4. Overall Quality (weighted average)

Conservative Quality Gate:
  Reject ONLY genuinely unusable images.
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
    # 1. FOCUS / BLUR
    # --------------------------------------------------------
    laplacian_raw = cv2.Laplacian(
        gray,
        cv2.CV_64F
    ).var()

    focus_score = np.clip(
        (laplacian_raw / 500.0) * 100.0,
        0,
        100
    )

    # --------------------------------------------------------
    # 2. ILLUMINATION
    # --------------------------------------------------------
    mean_brightness = float(np.mean(gray))

    brightness_score = 100.0 - (
        abs(mean_brightness - 128.0) / 128.0 * 100.0
    )

    dark_ratio = np.mean(gray < 30)
    bright_ratio = np.mean(gray > 245)

    illumination_penalty = (
        (dark_ratio + bright_ratio) * 100
    )

    illumination_score = np.clip(
        brightness_score - illumination_penalty,
        0,
        100
    )

    # --------------------------------------------------------
    # 3. FIELD OF VIEW
    # --------------------------------------------------------
    blurred = cv2.GaussianBlur(
        gray,
        (11, 11),
        0
    )

    _, fov_binary = cv2.threshold(
        blurred,
        10,
        255,
        cv2.THRESH_BINARY
    )

    kernel = np.ones(
        (7, 7),
        np.uint8
    )

    fov_binary = cv2.morphologyEx(
        fov_binary,
        cv2.MORPH_CLOSE,
        kernel
    )

    fov_binary = cv2.morphologyEx(
        fov_binary,
        cv2.MORPH_OPEN,
        kernel
    )

    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(
        fov_binary,
        connectivity=8
    )

    if num_labels > 1:

        largest_area = np.max(
            stats[1:, cv2.CC_STAT_AREA]
        )

        total_area = gray.shape[0] * gray.shape[1]

        fov_score = np.clip(
            (largest_area / total_area) * 100,
            0,
            100
        )

    else:
        fov_score = 0.0

    # --------------------------------------------------------
    # OVERALL SCORE
    # --------------------------------------------------------
    overall_score = (
        0.40 * focus_score +
        0.30 * illumination_score +
        0.30 * fov_score
    )

    # ========================================================
    # CONSERVATIVE QUALITY GATE
    #
    # Reject ONLY genuinely unusable images.
    # ========================================================

    severe_blur = laplacian_raw < 5.0
    severe_illumination = illumination_score < 30.0
    severe_fov = fov_score < 55.0

    # --------------------------------------------------------
    # FINAL DECISION
    # --------------------------------------------------------
    if (
        severe_blur
        or severe_illumination
        or severe_fov
    ):
        status = "UNGRADABLE"
    else:
        status = "ACCEPTED"

    return {
        "focus_raw": float(laplacian_raw),
        "focus": float(focus_score),
        "illumination": float(illumination_score),
        "fov": float(fov_score),
        "overall": float(overall_score),
        "status": status,

        "checks": {
            "severe_blur": bool(severe_blur),
            "severe_illumination": bool(severe_illumination),
            "severe_fov": bool(severe_fov)
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
        "status": enh_quality["status"],  # Final decision based on enhanced image
        "original": orig_quality,
        "enhanced": enh_quality,
        "change": {
            "focus": round(enh_quality["focus"] - orig_quality["focus"], 2),
            "illumination": round(enh_quality["illumination"] - orig_quality["illumination"], 2),
            "fov": round(enh_quality["fov"] - orig_quality["fov"], 2),
            "overall": round(enh_quality["overall"] - orig_quality["overall"], 2),
        },
    }
