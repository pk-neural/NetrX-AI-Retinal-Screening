"""
NetrX Model Manager

Loads all 4 models ONCE at startup:
  1. DR ViT-B/16 (APTOS-based) — state_dict, 5 classes, custom head 768->256->5
  2. DME ViT-B/16 (IDRiD-based) — state_dict, 3 classes, custom head 768->256->3
  3. DRIVE Vessel UNet — state_dict, enc/dec architecture, 1-channel output
  4. YOLO (for input-domain validation)

Uses CUDA when available, falls back to CPU.
Models are stored as repacked .pth files (state_dicts).
"""

import os
import logging
import torch
import torch.nn as nn
from torchvision import models

from backend.services.hf_downloader import ensure_model, HFDownloadError

logger = logging.getLogger("netrx.models")

# ── Model paths (relative to project root) ────────────────────
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")

# Model filenames — configurable via environment variables
DR_MODEL_FILE = os.environ.get("NETRX_DR_MODEL_FILE", "netrx_vit_b16_best.pth")
DME_MODEL_FILE = os.environ.get("NETRX_DME_MODEL_FILE", "netrx_idrid_dme_vit_b16_best.pth")

DR_MODEL_PATH = os.path.join(MODELS_DIR, DR_MODEL_FILE)
DME_MODEL_PATH = os.path.join(MODELS_DIR, DME_MODEL_FILE)
VESSEL_MODEL_PATH = os.path.join(MODELS_DIR, "netrx_drive_vessel_best.pth")
YOLO_MODEL_DIR = os.path.join(MODELS_DIR, "Yolo.pt")


# ── UNet Architecture (matching the trained vessel model) ─────
class UNetBlock(nn.Module):
    """Double convolution block used in the vessel UNet."""
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1, bias=True),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1, bias=True),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.block(x)


class VesselUNet(nn.Module):
    """UNet for retinal vessel segmentation (DRIVE dataset)."""
    def __init__(self, in_channels=3, out_channels=1):
        super().__init__()
        # Encoder
        self.enc1 = UNetBlock(in_channels, 32)
        self.enc2 = UNetBlock(32, 64)
        self.enc3 = UNetBlock(64, 128)

        # Bottleneck
        self.bottleneck = UNetBlock(128, 256)

        # Decoder
        self.up3 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.dec3 = UNetBlock(256, 128)
        self.up2 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.dec2 = UNetBlock(128, 64)
        self.up1 = nn.ConvTranspose2d(64, 32, 2, stride=2)
        self.dec1 = UNetBlock(64, 32)

        # Final 1x1 conv
        self.final = nn.Conv2d(32, out_channels, 1)

        self.pool = nn.MaxPool2d(2)

    def forward(self, x):
        # Encoder
        e1 = self.enc1(x)
        e2 = self.enc2(self.pool(e1))
        e3 = self.enc3(self.pool(e2))

        # Bottleneck
        b = self.bottleneck(self.pool(e3))

        # Decoder with skip connections
        d3 = self.up3(b)
        d3 = torch.cat([d3, e3], dim=1)
        d3 = self.dec3(d3)

        d2 = self.up2(d3)
        d2 = torch.cat([d2, e2], dim=1)
        d2 = self.dec2(d2)

        d1 = self.up1(d2)
        d1 = torch.cat([d1, e1], dim=1)
        d1 = self.dec1(d1)

        return self.final(d1)


def _build_vit_model(num_classes: int) -> nn.Module:
    """
    Build the exact ViT-B/16 architecture used during training.

    Architecture: torchvision.models.vit_b_16 with custom head:
      heads.head = Sequential(
        [0] Dropout(0.1),
        [1] Linear(768, 256),
        [2] ReLU(),
        [3] Dropout(0.1),
        [4] Linear(256, num_classes),
      )
    """
    model = models.vit_b_16(weights=None)

    # Replace head with custom architecture matching the state_dict
    # state_dict keys: heads.head.1 (Linear 768->256), heads.head.4 (Linear 256->num_classes)
    # This means indices 0=Dropout, 1=Linear, 2=ReLU, 3=Dropout, 4=Linear
    model.heads.head = nn.Sequential(
        nn.Dropout(0.1),
        nn.Linear(768, 256),
        nn.ReLU(),
        nn.Dropout(0.1),
        nn.Linear(256, num_classes),
    )

    return model


class ModelManager:
    """Singleton model manager that loads all NetrX models once."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Model device: {self.device}")

        self.dr_model = None
        self.dme_model = None
        self.vessel_model = None
        self.yolo_model = None

        self._load_status = {
            "dr": "not_loaded",
            "dme": "not_loaded",
            "vessel": "not_loaded",
            "yolo": "not_loaded",
        }

    def load_all(self):
        """Load all models. Call this during application startup."""
        self._load_dr_model()
        self._load_dme_model()
        self._load_vessel_model()
        self._load_yolo_model()
        self._report_status()

    def _load_dr_model(self):
        """Load the DR ViT-B/16 model (5 classes)."""
        try:
            # Ensure model is available (download from HF if needed)
            try:
                dr_path = ensure_model(DR_MODEL_FILE)
            except HFDownloadError as e:
                logger.error(f"DR model unavailable: {e}")
                self._load_status["dr"] = "missing"
                return

            if not os.path.isfile(dr_path):
                logger.error(f"DR model not found: {dr_path}")
                self._load_status["dr"] = "missing"
                return

            logger.info(f"Loading DR model from: {dr_path}")

            # Build architecture and load state_dict
            model = _build_vit_model(num_classes=5)
            state_dict = torch.load(dr_path, map_location=self.device, weights_only=False)
            model.load_state_dict(state_dict)
            model.eval()
            model.to(self.device)

            self.dr_model = model
            self._load_status["dr"] = "loaded"

            num_params = sum(p.numel() for p in model.parameters())
            logger.info(f"DR model loaded: {num_params:,} params, 5 classes")

        except Exception as e:
            logger.error(f"Failed to load DR model: {e}")
            self._load_status["dr"] = f"error: {str(e)[:100]}"

    def _load_dme_model(self):
        """Load the DME ViT-B/16 model (3 classes)."""
        try:
            # Ensure model is available (download from HF if needed)
            try:
                dme_path = ensure_model(DME_MODEL_FILE)
            except HFDownloadError as e:
                logger.error(f"DME model unavailable: {e}")
                self._load_status["dme"] = "missing"
                return

            if not os.path.isfile(dme_path):
                logger.error(f"DME model not found: {dme_path}")
                self._load_status["dme"] = "missing"
                return

            logger.info(f"Loading DME model from: {dme_path}")

            # Build architecture and load state_dict
            model = _build_vit_model(num_classes=3)
            state_dict = torch.load(dme_path, map_location=self.device, weights_only=False)
            model.load_state_dict(state_dict)
            model.eval()
            model.to(self.device)

            self.dme_model = model
            self._load_status["dme"] = "loaded"

            num_params = sum(p.numel() for p in model.parameters())
            logger.info(f"DME model loaded: {num_params:,} params, 3 classes")

        except Exception as e:
            logger.error(f"Failed to load DME model: {e}")
            self._load_status["dme"] = f"error: {str(e)[:100]}"

    def _load_vessel_model(self):
        """Load the DRIVE vessel UNet model."""
        try:
            if not os.path.isfile(VESSEL_MODEL_PATH):
                logger.error(f"Vessel model not found: {VESSEL_MODEL_PATH}")
                self._load_status["vessel"] = "missing"
                return

            logger.info(f"Loading vessel model from: {VESSEL_MODEL_PATH}")

            # Build UNet architecture and load state_dict
            model = VesselUNet(in_channels=3, out_channels=1)
            state_dict = torch.load(VESSEL_MODEL_PATH, map_location=self.device, weights_only=False)
            model.load_state_dict(state_dict)
            model.eval()
            model.to(self.device)

            self.vessel_model = model
            self._load_status["vessel"] = "loaded"

            num_params = sum(p.numel() for p in model.parameters())
            logger.info(f"Vessel model loaded: {num_params:,} params")

        except Exception as e:
            logger.error(f"Failed to load vessel model: {e}")
            self._load_status["vessel"] = f"error: {str(e)[:100]}"

    def _load_yolo_model(self):
        """Load the YOLO model for input-domain validation."""
        try:
            from ultralytics import YOLO

            # Check for yolo model file
            yolo_candidates = [
                os.path.join(YOLO_MODEL_DIR, "yolo11n.pt"),
                os.path.join(YOLO_MODEL_DIR, "yolov8n.pt"),
                os.path.join(YOLO_MODEL_DIR, "best.pt"),
                os.path.join(MODELS_DIR, "yolo11n.pt"),
            ]

            yolo_path = None
            for candidate in yolo_candidates:
                if os.path.isfile(candidate):
                    yolo_path = candidate
                    break

            if yolo_path is None:
                # Download yolo11n.pt
                logger.info("YOLO model not found locally. Downloading yolo11n.pt...")
                self.yolo_model = YOLO("yolo11n.pt")
                # Move to models dir
                downloaded = os.path.join(os.getcwd(), "yolo11n.pt")
                target = os.path.join(YOLO_MODEL_DIR, "yolo11n.pt")
                if os.path.isfile(downloaded) and not os.path.isfile(target):
                    import shutil
                    os.makedirs(YOLO_MODEL_DIR, exist_ok=True)
                    shutil.copy2(downloaded, target)
            else:
                logger.info(f"Loading YOLO model from: {yolo_path}")
                self.yolo_model = YOLO(yolo_path)

            self._load_status["yolo"] = "loaded"
            logger.info("YOLO model loaded successfully")

        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            self._load_status["yolo"] = f"error: {str(e)[:100]}"

    def _report_status(self):
        """Log the final model loading status."""
        logger.info("=" * 50)
        logger.info("NetrX Model Loading Status:")
        for model_name, status in self._load_status.items():
            icon = "[OK]" if status == "loaded" else "[FAIL]"
            logger.info(f"  {icon} {model_name.upper()}: {status}")
        logger.info("=" * 50)

    def get_status(self) -> dict:
        """Return model loading status for the health endpoint."""
        return {
            "device": str(self.device),
            "models": self._load_status.copy(),
            "all_loaded": all(s == "loaded" for s in self._load_status.values()),
        }

    @property
    def is_ready(self) -> bool:
        """Check if at minimum DR and DME models are loaded."""
        return (
            self._load_status["dr"] == "loaded"
            and self._load_status["dme"] == "loaded"
        )


# Global instance
model_manager = ModelManager()
