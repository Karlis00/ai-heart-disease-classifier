import torch
import numpy as np

from services.preprocessing.ecg_preprocessing import preprocess_ecg
from model.model_loader import load_model


# -------------------------------
# Load model once (IMPORTANT)
# -------------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = load_model()
model.to(device)
model.eval()


# -------------------------------
# Prediction Function
# -------------------------------
def predict_ecg(dat_bytes, hea_bytes):
    """
    Full ECG inference pipeline

    Input:
        dat_bytes: raw .dat file
        hea_bytes: raw .hea file

    Output:
        dict with probabilities and predictions
    """

    # 1️⃣ Preprocess ECG
    signal = preprocess_ecg(dat_bytes, hea_bytes)
    # shape: (12, 1000)

    # 2️⃣ Convert to tensor
    ecg_tensor = torch.tensor(signal, dtype=torch.float32)

    # add batch dimension → (1, 12, 1000)
    ecg_tensor = ecg_tensor.unsqueeze(0).to(device)

    # ⚠️ If your Mamba expects (batch, seq, features)
    # uncomment this line:
    # ecg_tensor = ecg_tensor.permute(0, 2, 1)  # → (1, 1000, 12)

    # 3️⃣ Model inference
    with torch.no_grad():
        outputs = model(ecg_tensor)

        # sigmoid for multilabel classification
        probs = torch.sigmoid(outputs).cpu().numpy()[0]

    # 4️⃣ Convert to binary predictions
    threshold = 0.5
    preds = (probs > threshold).astype(int)

    # 5️⃣ Optional: label mapping
    label_map = ["NORM", "MI", "STTC", "CD", "HYP"]

    predicted_labels = [
        label_map[i] for i, val in enumerate(preds) if val == 1
    ]

    # 6️⃣ Return result
    return {
        "probabilities": probs.tolist(),
        "predictions": preds.tolist(),
        "labels": predicted_labels
    }