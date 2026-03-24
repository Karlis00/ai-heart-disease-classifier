# services/preprocessing/ecg_preprocessing.py
import os
import tempfile
import numpy as np
import wfdb
from scipy.signal import resample


def preprocess_ecg(dat_bytes, hea_bytes, target_length=1000):
    """
    Preprocess ECG for 100Hz Mamba model.

    Args:
        dat_bytes (bytes): contents of .dat file
        hea_bytes (bytes): contents of .hea file
        target_length (int): number of samples per lead after preprocessing

    Returns:
        np.ndarray: shape (12, target_length)
    """

    with tempfile.TemporaryDirectory() as tmpdir:

        # -------------------------------
        # 1️⃣ Extract base filename from .hea
        # -------------------------------
        hea_lines = hea_bytes.decode().splitlines()
        base_name = hea_lines[0].split()[0]  # e.g., "01000_hr"

        dat_path = os.path.join(tmpdir, f"{base_name}.dat")
        hea_path = os.path.join(tmpdir, f"{base_name}.hea")

        # Save uploaded files
        with open(dat_path, "wb") as f:
            f.write(dat_bytes)
        with open(hea_path, "wb") as f:
            f.write(hea_bytes)

        # -------------------------------
        # 2️⃣ Load ECG using WFDB
        # -------------------------------
        signal, meta = wfdb.rdsamp(os.path.join(tmpdir, base_name))

        # (samples, channels) → (channels, samples)
        signal = signal.T

        # -------------------------------
        # 3️⃣ Resample ONLY if needed
        # -------------------------------
        fs = meta['fs']

        if fs != 100:
            target_resample_length = int(signal.shape[1] * (100 / fs))
            signal = resample(signal, target_resample_length, axis=1)
            print(f"Resampled from {fs}Hz → 100Hz")
        else:
            print("Input already 100Hz, skipping resampling")

        # -------------------------------
        # 4️⃣ Normalize per lead (Z-score)
        # -------------------------------
        signal = normalize_ecg(signal)

        # -------------------------------
        # 5️⃣ Fix length to target_length
        # -------------------------------
        signal = fix_length(signal, target_length)

        return signal


# -------------------------------
# Helper functions
# -------------------------------
def normalize_ecg(signal: np.ndarray) -> np.ndarray:
    """Z-score normalization per lead"""
    mean = np.mean(signal, axis=1, keepdims=True)
    std = np.std(signal, axis=1, keepdims=True) + 1e-8
    return (signal - mean) / std


def fix_length(signal: np.ndarray, target_length: int) -> np.ndarray:
    """Trim or pad signal to target_length"""
    channels, length = signal.shape

    if length > target_length:
        signal = signal[:, :target_length]
    elif length < target_length:
        pad = np.zeros((channels, target_length - length))
        signal = np.concatenate((signal, pad), axis=1)

    return signal