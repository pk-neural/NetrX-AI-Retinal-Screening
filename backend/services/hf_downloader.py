"""
NetrX — Hugging Face Model Downloader

Downloads model weights from a private Hugging Face repository when they
are not available locally.  Uses huggingface_hub.hf_hub_download() which
handles caching automatically — a file is only downloaded once.

Environment variables:
    HF_TOKEN           — Hugging Face access token (required for private repos)
    HF_MODEL_REPO      — Repository ID, e.g. "Pruthvii/netrx-models"
"""

import os
import logging

logger = logging.getLogger("netrx.hf_downloader")

# ── Defaults ──────────────────────────────────────────────────
_DEFAULT_REPO = "Pruthvii/netrx-models"

# Project paths
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")


class HFDownloadError(Exception):
    """Raised when a model cannot be downloaded from Hugging Face."""
    pass


def ensure_model(filename: str) -> str:
    """
    Ensure a model file is available locally, downloading from HF if needed.

    Args:
        filename: The model filename, e.g. "netrx_vit_b16_best.pth"

    Returns:
        Absolute path to the local model file.

    Raises:
        HFDownloadError: If the file is missing locally AND cannot be
                         downloaded (missing token, auth failure, etc.)
    """
    local_path = os.path.join(MODELS_DIR, filename)

    # ── Fast path: file already exists locally ──
    if os.path.isfile(local_path):
        logger.debug(f"Model already available locally: {local_path}")
        return local_path

    # ── Slow path: download from Hugging Face ──
    logger.info(f"Model not found locally at {local_path} — attempting HF download...")

    # Read environment
    hf_token = os.environ.get("HF_TOKEN", "").strip()
    hf_repo = os.environ.get("HF_MODEL_REPO", _DEFAULT_REPO).strip()

    if not hf_token:
        raise HFDownloadError(
            f"Model file '{filename}' not found locally and HF_TOKEN environment "
            f"variable is not set.  Cannot download from private repository.  "
            f"Either place the model at '{local_path}' or set HF_TOKEN in your .env file."
        )

    if not hf_repo:
        raise HFDownloadError(
            f"HF_MODEL_REPO environment variable is empty.  "
            f"Set it to the Hugging Face repo ID, e.g. 'Pruthvii/netrx-models'."
        )

    try:
        from huggingface_hub import hf_hub_download
    except ImportError:
        raise HFDownloadError(
            "huggingface_hub is not installed.  "
            "Run: pip install huggingface_hub"
        )

    try:
        logger.info(f"Downloading '{filename}' from HF repo '{hf_repo}'...")

        # Download directly into the models/ directory so the file ends up
        # at the exact path the rest of the codebase expects.
        os.makedirs(MODELS_DIR, exist_ok=True)

        downloaded_path = hf_hub_download(
            repo_id=hf_repo,
            filename=filename,
            token=hf_token,
            local_dir=MODELS_DIR,
            local_dir_use_symlinks=False,
        )

        # Verify the file actually arrived
        if not os.path.isfile(local_path):
            # hf_hub_download may return a cache path; copy if needed
            if os.path.isfile(downloaded_path) and downloaded_path != local_path:
                import shutil
                shutil.copy2(downloaded_path, local_path)
                logger.info(f"Copied downloaded model to {local_path}")

        if not os.path.isfile(local_path):
            raise HFDownloadError(
                f"Download appeared to succeed but '{local_path}' does not exist."
            )

        size_mb = os.path.getsize(local_path) / (1024 * 1024)
        logger.info(f"Model downloaded successfully: {local_path} ({size_mb:.1f} MB)")
        return local_path

    except HFDownloadError:
        raise
    except Exception as e:
        error_msg = str(e)
        # Detect common failure modes
        if "401" in error_msg or "Unauthorized" in error_msg:
            raise HFDownloadError(
                f"HF authentication failed for repo '{hf_repo}'.  "
                f"Check that HF_TOKEN is a valid access token with read permissions.  "
                f"Original error: {error_msg[:200]}"
            )
        elif "404" in error_msg or "not found" in error_msg.lower():
            raise HFDownloadError(
                f"File '{filename}' not found in HF repo '{hf_repo}'.  "
                f"Check the filename and repository.  "
                f"Original error: {error_msg[:200]}"
            )
        else:
            raise HFDownloadError(
                f"Failed to download '{filename}' from HF repo '{hf_repo}': "
                f"{error_msg[:300]}"
            )
