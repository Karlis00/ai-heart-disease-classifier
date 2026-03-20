import torch
import numpy as np

from services.preprocessing.ecg_preprocessing import preprocess_ecg
from services.models.model_loader import load_model


# load model only once when service starts
model = load_model()

# device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()


def predict_ecg(raw_ecg_bytes):
    """
    Main inference pipeline

    Steps:
    1. Decode uploaded ECG file
    2. Preprocess ECG signal
    3. Convert to tensor
    4. Run model inference
    5. Return prediction
    """

    # Step 1 — Convert raw input into ECG signal
    ecg_signal = preprocess_ecg(raw_ecg_bytes)

    # Step 2 — Convert to tensor
    ecg_tensor = torch.tensor(ecg_signal, dtype=torch.float32)

    # add batch dimension
    ecg_tensor = ecg_tensor.unsqueeze(0).to(device)

    # Step 3 — Model inference
    with torch.no_grad():
        outputs = model(ecg_tensor)

        probs = torch.sigmoid(outputs).cpu().numpy()[0]

    # Step 4 — Convert probabilities to labels
    threshold = 0.5
    predictions = (probs > threshold).astype(int)

    result = {
        "probabilities": probs.tolist(),
        "predictions": predictions.tolist()
    }

    return result