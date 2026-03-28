import torch
import torch.nn as nn


# -------------------------------
# Mamba Layer (Linear + GELU)
# -------------------------------
class MambaLayer(nn.Module):
    def __init__(self, d_model):
        super().__init__()
        self.linear = nn.Linear(d_model, d_model)
        self.activation = nn.GELU()

    def forward(self, x):
        """
        x: (batch, channels, seq_len)
        Applies sequence modeling along the temporal dimension using Linear + GELU
        """
        x = x.permute(0, 2, 1)      # (B, seq_len, C)
        out = self.activation(self.linear(x))
        out = out.permute(0, 2, 1)  # back to (B, C, seq_len)
        return out

# -------------------------------
# CNN + MAMBA MODEL
# -------------------------------
class CNN_MAMBA_v3(nn.Module):
    def __init__(self, n_classes=5):
        super().__init__()

        # ----- CNN Block 1 -----
        self.conv1 = nn.Conv1d(12, 32, kernel_size=5, padding=2)
        self.bn1   = nn.BatchNorm1d(32)
        self.pool1 = nn.MaxPool1d(2)

        # ----- CNN Block 2 -----
        self.conv2 = nn.Conv1d(32, 64, kernel_size=5, padding=2)
        self.bn2   = nn.BatchNorm1d(64)
        self.pool2 = nn.MaxPool1d(2)

        # ----- CNN Block 3 -----
        self.conv3 = nn.Conv1d(64, 128, kernel_size=5, padding=2)
        self.bn3   = nn.BatchNorm1d(128)
        self.pool3 = nn.MaxPool1d(2)

        # ----- Mamba Block -----
        self.mamba = MambaLayer(128)

        # ----- Classifier -----
        self.global_pool = nn.AdaptiveAvgPool1d(1)
        self.fc1 = nn.Linear(128, 128)
        self.out = nn.Linear(128, n_classes)

    def forward(self, x):
        """
        x: (batch, 12, seq_len)
        """

        # CNN 1
        x = self.pool1(torch.relu(self.bn1(self.conv1(x))))

        # CNN 2
        x = self.pool2(torch.relu(self.bn2(self.conv2(x))))

        # CNN 3
        x = self.pool3(torch.relu(self.bn3(self.conv3(x))))

        # Mamba: sequence modeling on rich features
        x = self.mamba(x)

        # Global pooling + classifier
        x = self.global_pool(x).squeeze(-1)
        x = torch.relu(self.fc1(x))
        x = self.out(x)
        return x