from model.model_architecture import CNN_MAMBA_v3
import torch
import os

_model = None
_device = None


def load_model():
    global _model, _device
    if _model is not None:
        return _model

    _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"🚀 Using device: {_device}")

    model_path = os.path.join(os.path.dirname(__file__), "ecg_model.pth")
    model = CNN_MAMBA_v3(n_classes=5)

    checkpoint = torch.load(model_path, map_location=_device)

    # Handle both plain state_dict or checkpoint with key
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]
    else:
        state_dict = checkpoint

    # remove 'module.' if trained with DataParallel
    new_state_dict = {k.replace("module.", ""): v for k, v in state_dict.items()}

    model.load_state_dict(new_state_dict, strict=False)
    model.to(_device)
    model.eval()

    _model = model
    print("✅ Model loaded with MambaLayer")
    return _model