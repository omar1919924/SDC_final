from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import joblib
import numpy as np
import torch

from config import FEATURES, MODEL_SAVE_PATH, SCALER_SAVE_PATH
from model.stress_mlp import StressMLP


@dataclass
class StressModelHook:
    model_path: Path = MODEL_SAVE_PATH
    scaler_path: Path = SCALER_SAVE_PATH

    def __post_init__(self) -> None:
        self.model = StressMLP(input_dim=len(FEATURES), num_classes=3)
        self.device = torch.device("cpu")
        self.model.to(self.device)
        self.model.eval()
        self.scaler = None
        self._load_artifacts()

    def _load_artifacts(self) -> None:
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Missing trained model file: {self.model_path}. Run retrain_trigger.py first."
            )
        if not self.scaler_path.exists():
            raise FileNotFoundError(
                f"Missing scaler file: {self.scaler_path}. Run retrain_trigger.py first."
            )

        state_dict = torch.load(self.model_path, map_location=self.device)
        self.model.load_state_dict(state_dict, strict=True)
        self.scaler = joblib.load(self.scaler_path)

    def predict(self, features: dict[str, float]) -> int:
        ordered = np.array([[float(features[name]) for name in FEATURES]], dtype=np.float32)
        transformed = self.scaler.transform(ordered)
        inputs = torch.tensor(transformed, dtype=torch.float32, device=self.device)
        with torch.no_grad():
            logits = self.model(inputs)
            prediction = int(torch.argmax(logits, dim=1).item())
        return prediction
