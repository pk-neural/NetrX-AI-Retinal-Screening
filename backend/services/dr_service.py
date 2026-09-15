"""
NetrX DR (Diabetic Retinopathy) Inference Service

Uses the trained APTOS-based ViT-B/16 model.
Predicts DR Grade 0–4.

Grade labels:
  0: No apparent diabetic retinopathy
  1: Mild non-proliferative diabetic retinopathy
  2: Moderate non-proliferative diabetic retinopathy
  3: Severe non-proliferative diabetic retinopathy
  4: Proliferative diabetic retinopathy

Referable DR: Grade 2, 3, or 4
"""

import torch
import torch.nn.functional as F
import logging

logger = logging.getLogger("netrx.dr")

DR_LABELS = {
    0: "No Apparent Diabetic Retinopathy",
    1: "Mild Non-Proliferative Diabetic Retinopathy",
    2: "Moderate Non-Proliferative Diabetic Retinopathy",
    3: "Severe Non-Proliferative Diabetic Retinopathy",
    4: "Proliferative Diabetic Retinopathy",
}

DR_SHORT_LABELS = {
    0: "No DR",
    1: "Mild NPDR",
    2: "Moderate NPDR",
    3: "Severe NPDR",
    4: "PDR",
}


def predict_dr(model, input_tensor: torch.Tensor) -> dict:
    """
    Run DR inference.

    Args:
        model: Loaded DR ViT model
        input_tensor: Preprocessed input tensor (1, 3, 224, 224)

    Returns:
        dict with grade, label, short_label, confidence, probabilities, referable status
    """
    device = next(model.parameters()).device
    input_tensor = input_tensor.to(device)

    model.eval()
    with torch.no_grad():
        output = model(input_tensor)

    # Apply softmax to get probabilities
    probabilities = F.softmax(output, dim=1).squeeze().cpu().numpy()

    # Get predicted grade
    grade = int(probabilities.argmax())
    confidence = float(probabilities[grade]) * 100.0

    # Referable DR: Grade 2, 3, or 4
    referable = grade >= 2
    referable_probability = float(sum(probabilities[2:])) * 100.0

    return {
        "grade": grade,
        "label": DR_LABELS.get(grade, f"Grade {grade}"),
        "short_label": DR_SHORT_LABELS.get(grade, f"Grade {grade}"),
        "confidence": round(confidence, 2),
        "probabilities": [round(float(p), 6) for p in probabilities],
        "referable": referable,
        "referable_probability": round(referable_probability, 2),
    }
