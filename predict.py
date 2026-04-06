from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from src.features.window_features import SENSOR_COLUMNS, build_window_features


@dataclass
class PredictionResult:
    timestamp: str
    probability_not_concentrated: float
    decision: str


class RealtimeConcentrationPredictor:
    def __init__(
        self,
        model_path: Path,
        threshold: float = 0.55,
        smoothing_window: int = 5,
        hysteresis: float = 0.05,
    ) -> None:
        payload = joblib.load(model_path)
        self.model = payload["model"]
        self.feature_columns = payload["feature_columns"]
        self.window_size = int(payload["window_size"])
        self.label_map = payload["label_map"]

        self.threshold = threshold
        self.hysteresis = hysteresis
        self.smoothing_window = smoothing_window

        self.buffer: deque[dict[str, float | str]] = deque(maxlen=self.window_size)
        self.probability_history: deque[float] = deque(maxlen=self.smoothing_window)
        self.current_state = "concentrated"

    def _build_feature_row(self) -> pd.DataFrame:
        frame = pd.DataFrame(list(self.buffer))
        engineered = build_window_features(frame, window_size=self.window_size)
        row = engineered.iloc[[-1]][self.feature_columns]
        return row

    def _apply_hysteresis(self, probability_not_concentrated: float) -> str:
        to_not_concentrated = self.threshold
        to_concentrated = self.threshold - self.hysteresis

        if self.current_state == "concentrated":
            if probability_not_concentrated >= to_not_concentrated:
                self.current_state = "not_concentrated"
        else:
            if probability_not_concentrated <= to_concentrated:
                self.current_state = "concentrated"

        return self.current_state

    def predict_event(self, heart_rate: int, acceleration: float, gsr: float, timestamp: str | None = None) -> PredictionResult:
        if timestamp is None:
            timestamp = datetime.utcnow().isoformat()

        event = {
            "heart_rate": float(heart_rate),
            "acceleration": float(acceleration),
            "gsr": float(gsr),
            "timestamp": timestamp,
        }
        self.buffer.append(event)

        if len(self.buffer) < self.window_size:
            return PredictionResult(timestamp=timestamp, probability_not_concentrated=0.0, decision="warming_up")

        row = self._build_feature_row()
        if hasattr(self.model, "predict_proba"):
            raw_probability = float(self.model.predict_proba(row)[0][1])
        else:
            margin = float(self.model.decision_function(row)[0])
            raw_probability = float(1.0 / (1.0 + np.exp(-margin)))

        self.probability_history.append(raw_probability)
        smoothed_probability = float(np.mean(self.probability_history))
        decision = self._apply_hysteresis(smoothed_probability)

        return PredictionResult(
            timestamp=timestamp,
            probability_not_concentrated=round(smoothed_probability, 4),
            decision=decision,
        )
