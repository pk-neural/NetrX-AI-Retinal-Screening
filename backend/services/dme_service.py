"""
NetrX DME (Diabetic Macular Edema) Inference Service

Uses the trained IDRiD-based ViT-B/16 model.
Predicts DME Risk 0–2.

Risk labels:
  0: Low DME Risk
  1: Intermediate DME Risk
  2: High DME Risk
"""

import torch
import torch.nn.functional as F
import logging

logger = logging.getLogger("netrx.dme")

DME_LABELS = {
    0: "Low DME Risk",
    1: "Intermediate DME Risk",
    2: "High DME Risk",
}

DME_SHORT_LABELS = {
    0: "LOW",
    1: "INTERMEDIATE",
    2: "HIGH",
}


def predict_dme(model, input_tensor: torch.Tensor) -> dict:
    """
    Run DME inference.

    Args:
        model: Loaded DME ViT model
        input_tensor: Preprocessed input tensor (1, 3, 224, 224)

    Returns:
        dict with risk, label, short_label, confidence, probabilities
    """
    device = next(model.parameters()).device
    input_tensor = input_tensor.to(device)

    model.eval()
    with torch.no_grad():
        output = model(input_tensor)

    # Apply softmax to get probabilities
    probabilities = F.softmax(output, dim=1).squeeze().cpu().numpy()

    # Get predicted risk level
    risk = int(probabilities.argmax())
    confidence = float(probabilities[risk]) * 100.0

    return {
        "risk": risk,
        "label": DME_LABELS.get(risk, f"Risk {risk}"),
        "short_label": DME_SHORT_LABELS.get(risk, f"Risk {risk}"),
        "confidence": round(confidence, 2),
        "probabilities": [round(float(p), 6) for p in probabilities],
    }
