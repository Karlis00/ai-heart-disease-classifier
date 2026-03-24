import torch
import os
from model.model_architecture import CNN_MAMBA_v3

_model = None

def load_model():
    global _model
    if _model is not None:
        return _model

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model_path = os.path.join(os.path.dirname(__file__), "ecg_model.pth")

    model = CNN_MAMBA_v3(n_classes=5)

    checkpoint = torch.load(model_path, map_location=device)

    # -------------------------------
    # Load state dict safely
    # -------------------------------
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
    else:
        state_dict = checkpoint

    # Load while ignoring unexpected keys
    model.load_state_dict(state_dict, strict=False)

    model.to(device)
    model.eval()

    _model = model
    print("✅ Model loaded successfully (Mamba skipped)")
    return model