"""
NetrX RAG (Clinical Interpretation) Service

Generates prediction-aware clinical interpretation based on all model outputs.
Uses a deterministic clinical knowledge base instead of external LLM retrieval.

All interpretations use screening language — never definitive diagnoses.
"""


# ── DR Grade Interpretations ─────────────────────────────────
DR_INTERPRETATIONS = {
    0: {
        "label": "No Apparent Diabetic Retinopathy",
        "short": "No DR",
        "clinical_meaning": (
            "AI screening findings show no apparent signs of diabetic retinopathy. "
            "The retinal structures appear within normal limits based on the AI model's analysis. "
            "This is a screening result and does not replace a comprehensive clinical examination."
        ),
        "referral": "routine",
        "urgency": "low",
    },
    1: {
        "label": "Mild Non-Proliferative Diabetic Retinopathy (Mild NPDR)",
        "short": "Mild NPDR",
        "clinical_meaning": (
            "AI screening findings are consistent with mild non-proliferative diabetic retinopathy. "
            "This may include scattered microaneurysms. At this stage, vision is typically not affected, "
            "but regular monitoring is recommended to track any progression."
        ),
        "referral": "followup",
        "urgency": "low",
    },
    2: {
        "label": "Moderate Non-Proliferative Diabetic Retinopathy (Moderate NPDR)",
        "short": "Moderate NPDR",
        "clinical_meaning": (
            "AI screening findings are consistent with moderate non-proliferative diabetic retinopathy. "
            "This is considered a referable level of disease. Features may include multiple microaneurysms, "
            "dot-blot hemorrhages, and possible hard exudates. Ophthalmologic evaluation is recommended."
        ),
        "referral": "ophthalmologist",
        "urgency": "moderate",
    },
    3: {
        "label": "Severe Non-Proliferative Diabetic Retinopathy (Severe NPDR)",
        "short": "Severe NPDR",
        "clinical_meaning": (
            "AI screening findings are consistent with severe non-proliferative diabetic retinopathy. "
            "This is considered a referable level of disease and requires further evaluation by an ophthalmologist. "
            "Features may include extensive hemorrhages, venous beading, and intraretinal microvascular abnormalities (IRMA). "
            "There is a significant risk of progression to proliferative diabetic retinopathy."
        ),
        "referral": "ophthalmologist",
        "urgency": "high",
    },
    4: {
        "label": "Proliferative Diabetic Retinopathy (PDR)",
        "short": "PDR",
        "clinical_meaning": (
            "AI screening findings are consistent with proliferative diabetic retinopathy. "
            "This is the most advanced stage and is considered a sight-threatening condition. "
            "Features may include neovascularization, vitreous hemorrhage, or tractional retinal detachment. "
            "Urgent ophthalmic referral is strongly recommended."
        ),
        "referral": "urgent",
        "urgency": "urgent",
    },
}

# ── DME Risk Interpretations ─────────────────────────────────
DME_INTERPRETATIONS = {
    0: {
        "label": "Low DME Risk",
        "short": "LOW",
        "meaning": (
            "AI-estimated diabetic macular edema risk is low. "
            "No significant macular involvement is suggested by the model."
        ),
    },
    1: {
        "label": "Intermediate DME Risk",
        "short": "INTERMEDIATE",
        "meaning": (
            "AI-estimated diabetic macular edema risk is intermediate. "
            "There may be early signs suggestive of macular involvement. "
            "Clinical correlation and OCT evaluation may be considered when clinically indicated."
        ),
    },
    2: {
        "label": "High DME Risk",
        "short": "HIGH",
        "meaning": (
            "Findings are suggestive of possible macular edema (DME). "
            "OCT evaluation and clinical examination are recommended for confirmation "
            "when clinically indicated."
        ),
    },
}


def generate_recommendation(dr_grade: int, dme_risk: int, quality_status: str) -> dict:
    """Generate recommendation bullets based on screening results."""
    recommendations = []
    referral_title = "Continue Routine Screening"

    if dr_grade >= 3 or dme_risk >= 2:
        referral_title = "Refer to Ophthalmologist"
        recommendations = [
            "Comprehensive ophthalmic examination is recommended.",
            "Consider OCT for evaluation of macular edema (DME).",
            "Timely management is advised to prevent disease progression.",
            "Follow-up as per clinical guidelines and treating physician's judgment.",
        ]
    elif dr_grade == 2 or dme_risk == 1:
        referral_title = "Refer to Ophthalmologist"
        recommendations = [
            "Ophthalmologic evaluation is recommended within 4–6 weeks.",
            "Consider OCT evaluation when clinically indicated for DME assessment.",
            "Regular monitoring of retinal status is advised.",
            "Follow-up should be based on the treating clinician's judgment.",
        ]
    elif dr_grade == 1:
        referral_title = "Follow-up Screening"
        recommendations = [
            "Repeat diabetic retinopathy screening in 6–12 months.",
            "Optimize glycemic control and blood pressure management.",
            "Ophthalmologist referral if any progression is observed.",
            "Maintain regular diabetes management follow-ups.",
        ]
    else:
        referral_title = "Continue Routine Screening"
        recommendations = [
            "Routine annual diabetic eye screening in 12 months.",
            "Continue optimal glycemic control.",
            "Monitor for any visual symptoms.",
            "Follow standard diabetes care guidelines.",
        ]

    if quality_status == "BORDERLINE":
        recommendations.append(
            "Note: Image quality was borderline. Consider re-screening with improved image quality for higher confidence."
        )

    return {
        "title": referral_title,
        "bullets": recommendations,
    }


def generate_clinical_impression(
    dr_grade: int,
    dr_confidence: float,
    dme_risk: int,
    dme_confidence: float,
    vessel_status: str,
    quality_status: str,
) -> str:
    """Generate a concise clinical impression paragraph."""
    dr_info = DR_INTERPRETATIONS.get(dr_grade, DR_INTERPRETATIONS[0])
    dme_info = DME_INTERPRETATIONS.get(dme_risk, DME_INTERPRETATIONS[0])

    referable = "referable" if dr_grade >= 2 else "non-referable"

    impression = (
        f"The image shows AI screening features consistent with {dr_info['short']} "
        f"(Grade {dr_grade}, confidence: {dr_confidence:.1f}%). "
        f"The case is classified as {referable}. "
        f"The AI-estimated DME risk is {dme_info['short'].lower()} "
        f"(confidence: {dme_confidence:.1f}%). "
    )

    if vessel_status and vessel_status != "unavailable":
        impression += "AI-based retinal vessel analysis has been performed. "

    impression += f"The image quality was {quality_status.lower()}."

    return impression


def generate_clinical_evidence(dr_grade: int, dme_risk: int) -> list:
    """Generate clinical evidence items relevant to the prediction."""
    evidence = []

    if dr_grade == 0:
        evidence.append({
            "source": "ETDRS Study (1991)",
            "content": "Grade 0 indicates no clinically significant retinal lesions observed. Annual screening is recommended for diabetic patients.",
        })
    elif dr_grade == 1:
        evidence.append({
            "source": "ETDRS Study (1991)",
            "content": "Mild NPDR is characterized by at least one microaneurysm. Risk of progression to PDR within 5 years is approximately 5%.",
        })
    elif dr_grade == 2:
        evidence.append({
            "source": "ETDRS Study (1991)",
            "content": "Moderate NPDR is characterized by the presence of microaneurysms, dot hemorrhages, and/or hard exudates not meeting severe NPDR criteria.",
        })
        evidence.append({
            "source": "AAO Guidelines (2019)",
            "content": "Patients with moderate NPDR should be referred for ophthalmologic evaluation. Risk of progression to PDR within one year is approximately 12–27%.",
        })
    elif dr_grade == 3:
        evidence.append({
            "source": "ETDRS Study (1991)",
            "content": "Severe NPDR follows the 4-2-1 rule: extensive hemorrhages in 4 quadrants, venous beading in 2+ quadrants, or IRMA in 1+ quadrant.",
        })
        evidence.append({
            "source": "DRS Study (1981)",
            "content": "Approximately 52% of eyes with severe NPDR progress to PDR within one year. Timely referral is critical.",
        })
    elif dr_grade == 4:
        evidence.append({
            "source": "DRS Study (1981)",
            "content": "PDR is characterized by neovascularization of the disc or elsewhere. Without treatment, vision loss risk is substantial.",
        })
        evidence.append({
            "source": "DRCR.net Protocol S (2015)",
            "content": "Anti-VEGF therapy has shown non-inferiority to panretinal photocoagulation for PDR treatment with better visual field preservation.",
        })

    if dme_risk >= 2:
        evidence.append({
            "source": "DRCR.net Protocol T (2015)",
            "content": "DME is the most common cause of vision loss in diabetic retinopathy. Anti-VEGF agents are first-line therapy for center-involving DME.",
        })

    return evidence


def generate_interpretation(
    dr_grade: int,
    dr_confidence: float,
    dr_probabilities: list,
    dme_risk: int,
    dme_confidence: float,
    vessel_status: str,
    quality_status: str,
) -> dict:
    """
    Generate the complete clinical interpretation (RAG output).

    Returns:
        dict with evidence, clinical_impression, recommendation, and dr/dme interpretations
    """
    dr_info = DR_INTERPRETATIONS.get(dr_grade, DR_INTERPRETATIONS[0])
    dme_info = DME_INTERPRETATIONS.get(dme_risk, DME_INTERPRETATIONS[0])

    referable = dr_grade >= 2
    referable_probability = sum(dr_probabilities[2:]) * 100.0 if len(dr_probabilities) >= 5 else None

    return {
        "dr_interpretation": dr_info,
        "dme_interpretation": dme_info,
        "referable": {
            "status": referable,
            "probability": round(referable_probability, 2) if referable_probability is not None else None,
        },
        "evidence": generate_clinical_evidence(dr_grade, dme_risk),
        "clinical_impression": generate_clinical_impression(
            dr_grade, dr_confidence, dme_risk, dme_confidence, vessel_status, quality_status
        ),
        "recommendation": generate_recommendation(dr_grade, dme_risk, quality_status),
    }
