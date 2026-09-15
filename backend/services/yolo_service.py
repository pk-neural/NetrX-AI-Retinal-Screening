"""
NetrX YOLO Input-Domain Validation Service

Uses YOLO for sanity checking whether the uploaded image contains
obvious non-fundus objects. NOT used for DR diagnosis.

Rejection object set (19 categories):
  person, bicycle, car, motorcycle, airplane, bus, train, truck, boat,
  cat, dog, horse, sheep, cow, elephant, bear, zebra, giraffe, bird

Detection confidence threshold: 0.40
"""

import logging

logger = logging.getLogger("netrx.yolo")

# ── Rejected object classes ───────────────────────────────────
REJECTED_OBJECTS = {
    "person", "bicycle", "car", "motorcycle", "airplane",
    "bus", "train", "truck", "boat", "cat", "dog", "horse",
    "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "bird",
}

CONFIDENCE_THRESHOLD = 0.40


def check_domain(yolo_model, image_bytes: bytes) -> dict:
    """
    Run YOLO inference on image bytes and check for rejected objects.

    Args:
        yolo_model: Loaded YOLO model instance
        image_bytes: Raw image bytes

    Returns:
        dict with:
          - valid: bool - whether image passes domain check
          - detected_objects: list of all detected objects with confidence
          - rejected_objects: list of rejected objects found
          - highest_relevant_confidence: float - highest confidence among rejected objects
          - reason: str - explanation
    """
    import numpy as np
    import cv2

    # Decode image — try cv2 first, fallback to PIL for formats cv2 can't handle
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        try:
            from PIL import Image
            import io
            pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
            logger.info("Image decoded via PIL fallback")
        except Exception as e:
            logger.warning(f"Both cv2 and PIL failed to decode image: {e}")
            return {
                "valid": False,
                "detected_objects": [],
                "rejected_objects": [],
                "highest_relevant_confidence": 0.0,
                "reason": "Could not decode image",
            }

    # Run YOLO inference
    try:
        results = yolo_model(img, verbose=False)
    except Exception as e:
        logger.error(f"YOLO inference failed: {e}")
        # If YOLO fails, allow the image through (fail-open for domain check)
        return {
            "valid": True,
            "detected_objects": [],
            "rejected_objects": [],
            "highest_relevant_confidence": 0.0,
            "reason": "YOLO check unavailable — proceeding with analysis",
        }

    detected_objects = []
    rejected_objects = []
    highest_relevant_confidence = 0.0

    for result in results:
        if result.boxes is None:
            continue
        for box in result.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            class_name = result.names[cls_id]

            detected_objects.append({
                "object": class_name,
                "confidence": round(conf, 4),
            })

            if class_name.lower() in REJECTED_OBJECTS and conf >= CONFIDENCE_THRESHOLD:
                rejected_objects.append({
                    "object": class_name,
                    "confidence": round(conf, 4),
                })
                if conf > highest_relevant_confidence:
                    highest_relevant_confidence = conf

    if rejected_objects:
        primary_object = max(rejected_objects, key=lambda x: x["confidence"])
        return {
            "valid": False,
            "detected_objects": detected_objects,
            "rejected_objects": rejected_objects,
            "highest_relevant_confidence": round(highest_relevant_confidence, 4),
            "reason": f"Non-fundus object detected: {primary_object['object']} "
                      f"(confidence: {primary_object['confidence']:.1%}). "
                      f"Not a retinal fundus image.",
        }

    return {
        "valid": True,
        "detected_objects": detected_objects,
        "rejected_objects": [],
        "highest_relevant_confidence": 0.0,
        "reason": "No non-fundus objects detected. Image passes domain sanity check.",
    }
