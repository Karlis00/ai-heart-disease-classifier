import torch
import os
from model.model_architecture import CNN_MAMBA_v3

_model = None
_device = None


def load_model():
    global _model, _device

    if _model is not None:
        return _model

    # -------------------------------
    # Device setup (IMPORTANT for Mamba)
    # -------------------------------
    _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    print(f"🚀 Using device: {_device}")

    # -------------------------------
    # Load model
    # -------------------------------
    model = CNN_MAMBA_v3(n_classes=5)

    model_path = os.path.join(os.path.dirname(__file__), "ecg_model.pth")

    # Load checkpoint
    checkpoint = torch.load(model_path, map_location=_device)

    # -------------------------------
    # Extract state_dict safely
    # -------------------------------
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
    else:
        state_dict = checkpoint

    # -------------------------------
    # Fix potential key mismatch (optional but useful)
    # -------------------------------
    new_state_dict = {}
    for k, v in state_dict.items():
        # remove 'module.' if trained with DataParallel
        new_key = k.replace("module.", "")
        new_state_dict[new_key] = v

    # -------------------------------
    # Load weights
    # -------------------------------
    missing, unexpected = model.load_state_dict(new_state_dict, strict=False)

    if missing:
        print(f"⚠️ Missing keys: {len(missing)}")
    if unexpected:
        print(f"⚠️ Unexpected keys: {len(unexpected)}")

    # -------------------------------
    # Move to device
    # -------------------------------
    model.to(_device)
    model.eval()

    _model = model

    # -------------------------------
    # Final status message
    # -------------------------------
    if _device.type == "cuda":
        print("✅ Model loaded with Mamba on GPU")
    else:
        print("⚠️ Model loaded on CPU (Mamba may fallback)")

    return _model


def get_device():
    return _device