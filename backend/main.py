"""
NetrX Backend — FastAPI Application

Primary endpoint: POST /api/analyze
Health endpoint: GET /api/health

The full pipeline:
  Image Upload → YOLO Check → Preprocessing → Quality → DR/DME/Vessel → GradCAM → RAG → JSON Result
"""

import os
import sys
import io
import time
import uuid
import logging
import base64
from datetime import datetime, timezone, timedelta
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("netrx.api")

# Add project root to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.model_manager import model_manager
from backend.services.yolo_service import check_domain
from backend.services.preprocessing import preprocess_pipeline, decode_image_bytes
from backend.services.quality import assess_quality
from backend.services.dr_service import predict_dr
from backend.services.dme_service import predict_dme
from backend.services.vessel_service import predict_vessels
from backend.services.gradcam_service import generate_gradcam
from backend.services.rag_service import generate_interpretation


# ── Application Lifespan ──────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup, cleanup on shutdown."""
    logger.info("NetrX Backend starting — loading models...")
    model_manager.load_all()
    logger.info("Model loading complete. Backend ready.")
    yield
    logger.info("NetrX Backend shutting down.")


# ── FastAPI App ───────────────────────────────────────────────
app = FastAPI(
    title="NetrX API",
    description="AI-Assisted Retinal Screening Backend",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health Check ──────────────────────────────────────────────
@app.get("/api/health")
async def health():
    """Return backend and model loading status."""
    return {
        "status": "ok",
        "models": model_manager.get_status(),
        "timestamp": datetime.now(timezone(timedelta(hours=5, minutes=30))).isoformat(),
    }


# ── Domain Check Only ────────────────────────────────────────
@app.post("/api/domain-check")
async def domain_check(file: UploadFile = File(...)):
    """
    Run YOLO input-domain validation only.
    Quick check before full analysis pipeline.
    """
    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        # Validate file type
        content_type = file.content_type or ""
        filename = file.filename or ""
        if not _is_valid_image(content_type, filename):
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Please upload DICOM, JPG, PNG, or TIFF.",
            )

        # Run YOLO check
        if model_manager.yolo_model is not None:
            domain_result = check_domain(model_manager.yolo_model, image_bytes)
        else:
            domain_result = {
                "valid": True,
                "detected_objects": [],
                "rejected_objects": [],
                "highest_relevant_confidence": 0.0,
                "reason": "YOLO model not available — domain check skipped.",
            }

        return {"success": True, "domain_check": domain_result}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Domain check failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Domain check failed. Please try again.")


# ── Full Analysis Pipeline ────────────────────────────────────
@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):
    """
    Run the complete NetrX analysis pipeline:
    YOLO → Preprocessing → Quality → DR/DME/Vessel → GradCAM → RAG → Report
    """
    start_time = time.time()

    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        filename = file.filename or "uploaded_image"
        content_type = file.content_type or ""

        if not _is_valid_image(content_type, filename):
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Please upload DICOM, JPG, PNG, or TIFF.",
            )

        # Generate report ID
        ist = timezone(timedelta(hours=5, minutes=30))
        now = datetime.now(ist)
        report_id = f"NRX-{now.strftime('%Y%m%d')}-{str(uuid.uuid4())[:3].upper()}"

        result = {
            "success": True,
            "report_id": report_id,
            "timestamp": now.isoformat(),
            "date": now.strftime("%d %b %Y"),
            "time": now.strftime("%I:%M %p"),
            "input": {
                "filename": filename,
                "format": os.path.splitext(filename)[1].upper().lstrip(".") or "UNKNOWN",
            },
        }

        # ── STAGE 1: YOLO Domain Check ───────────────────────
        logger.info(f"[{report_id}] Stage 1: YOLO domain check")
        if model_manager.yolo_model is not None:
            domain_result = check_domain(model_manager.yolo_model, image_bytes)
        else:
            domain_result = {
                "valid": True,
                "detected_objects": [],
                "rejected_objects": [],
                "highest_relevant_confidence": 0.0,
                "reason": "YOLO model not available — domain check skipped.",
            }

        result["domain_check"] = domain_result

        if not domain_result["valid"]:
            # Stop pipeline — non-fundus image
            result["pipeline_stopped"] = True
            result["stop_reason"] = "domain_invalid"
            elapsed = time.time() - start_time
            result["processing_time"] = round(elapsed, 2)
            return result

        # ── STAGE 2: Preprocessing ───────────────────────────
        logger.info(f"[{report_id}] Stage 2: Preprocessing")
        try:
            preprocess_result = preprocess_pipeline(image_bytes)
        except Exception as e:
            logger.error(f"Preprocessing failed: {e}")
            raise HTTPException(status_code=400, detail=f"Image preprocessing failed: {str(e)}")

        result["preprocessing"] = {
            "original_image": preprocess_result["original_b64"],
            "enhanced_image": preprocess_result["enhanced_b64"],
            "original_width": preprocess_result["original_width"],
            "original_height": preprocess_result["original_height"],
            "model_input_size": preprocess_result["model_input_size"],
        }

        # ── STAGE 3: Quality Assessment ──────────────────────
        logger.info(f"[{report_id}] Stage 3: Quality assessment")
        quality_result = assess_quality(
            preprocess_result["original_bgr"],
            preprocess_result["enhanced_bgr"],
        )
        result["quality"] = quality_result

        if quality_result["status"] == "UNGRADABLE":
            # Stop pipeline — image quality too low
            result["pipeline_stopped"] = True
            result["stop_reason"] = "quality_ungradable"
            elapsed = time.time() - start_time
            result["processing_time"] = round(elapsed, 2)
            return result

        # ── STAGE 4: AI Analysis (DR + DME + Vessels) ────────
        model_tensor = preprocess_result["model_tensor"]

        # DR Prediction
        logger.info(f"[{report_id}] Stage 4a: DR inference")
        if model_manager.dr_model is not None:
            dr_result = predict_dr(model_manager.dr_model, model_tensor)
        else:
            dr_result = {
                "grade": 0, "label": "Model unavailable", "short_label": "N/A",
                "confidence": 0.0, "probabilities": [], "referable": False,
                "referable_probability": 0.0,
            }
        result["dr"] = dr_result

        # DME Prediction
        logger.info(f"[{report_id}] Stage 4b: DME inference")
        if model_manager.dme_model is not None:
            dme_result = predict_dme(model_manager.dme_model, model_tensor)
        else:
            dme_result = {
                "risk": 0, "label": "Model unavailable", "short_label": "N/A",
                "confidence": 0.0, "probabilities": [],
            }
        result["dme"] = dme_result

        # Vessel Analysis
        logger.info(f"[{report_id}] Stage 4c: Vessel analysis")
        if model_manager.vessel_model is not None:
            vessel_result = predict_vessels(
                model_manager.vessel_model,
                model_tensor,
                preprocess_result["original_bgr"],
            )
        else:
            vessel_result = {"status": "unavailable", "coverage": 0.0, "mask": None, "overlay": None}
        result["vessels"] = vessel_result

        # ── STAGE 5: Grad-CAM ────────────────────────────────
        logger.info(f"[{report_id}] Stage 5: Grad-CAM")
        if model_manager.dr_model is not None:
            gradcam_result = generate_gradcam(
                model_manager.dr_model,
                model_tensor,
                preprocess_result["original_bgr"],
                target_class=dr_result["grade"],
            )
        else:
            gradcam_result = {"gradcam_image": None, "heatmap_image": None}
        result["gradcam"] = gradcam_result

        # ── STAGE 6: RAG / Clinical Interpretation ───────────
        logger.info(f"[{report_id}] Stage 6: Clinical interpretation")
        rag_result = generate_interpretation(
            dr_grade=dr_result["grade"],
            dr_confidence=dr_result["confidence"],
            dr_probabilities=dr_result["probabilities"],
            dme_risk=dme_result["risk"],
            dme_confidence=dme_result["confidence"],
            vessel_status=vessel_result.get("status", "unavailable"),
            quality_status=quality_result["status"],
        )
        result["rag"] = rag_result

        # ── Done ─────────────────────────────────────────────
        result["pipeline_stopped"] = False
        elapsed = time.time() - start_time
        result["processing_time"] = round(elapsed, 2)

        logger.info(f"[{report_id}] Analysis complete in {elapsed:.2f}s — "
                     f"DR Grade {dr_result['grade']}, DME Risk {dme_result['risk']}")

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis pipeline failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Analysis failed. Please try again.")


# ── Helpers ───────────────────────────────────────────────────
def _is_valid_image(content_type: str, filename: str) -> bool:
    """Check if the uploaded file is a supported image format."""
    valid_types = {"image/jpeg", "image/png", "image/tiff", "image/bmp", "image/webp"}
    valid_extensions = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".bmp", ".dcm", ".dicom", ".webp", ".avif"}

    if content_type.lower() in valid_types:
        return True

    ext = os.path.splitext(filename)[1].lower()
    if ext in valid_extensions:
        return True

    # Allow application/dicom
    if "dicom" in content_type.lower():
        return True

    return False


# ── Run ───────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
