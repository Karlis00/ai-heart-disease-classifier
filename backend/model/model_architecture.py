import torch
import torch.nn as nn

# -------------------------------
# Mamba Layer Wrapper
# -------------------------------
try:
    from mamba_ssm import Mamba
except ImportError:
    Mamba = None


class MambaLayer(nn.Module):
    def __init__(self, d_model):
        super().__init__()

        if Mamba is not None:
            self.use_mamba = True
            self.mamba = Mamba(
                d_model=d_model,
                d_state=16,
                d_conv=4,
                expand=2
            )
        else:
            print("Mamba not available, using Identity.")
            self.use_mamba = False
            self.mamba = nn.Identity()

    def forward(self, x):
        """
        Input: (B, C, L)
        Mamba expects: (B, L, D)
        """

        if self.use_mamba:
            # (B, C, L) → (B, L, C)
            x = x.transpose(1, 2)

            x = self.mamba(x)

            # (B, L, C) → (B, C, L)
            x = x.transpose(1, 2)

        else:
            x = self.mamba(x)

        return x


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
        Input: (batch, 12, 1000)
        """

        # CNN 1
        x = self.pool1(torch.relu(self.bn1(self.conv1(x))))

        # CNN 2
        x = self.pool2(torch.relu(self.bn2(self.conv2(x))))

        # CNN 3
        x = self.pool3(torch.relu(self.bn3(self.conv3(x))))

        # Mamba (ACTIVE)
        x = self.mamba(x)

        # Global pooling
        x = self.global_pool(x).squeeze(-1)

        # FC
        x = torch.relu(self.fc1(x))
        return self.out(x)