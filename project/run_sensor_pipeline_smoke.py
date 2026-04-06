from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path

import numpy as np

from sensor_pipeline.pipeline import RealtimeSensorPipeline


class DummyModelHook:
    def predict(self, features: dict[str, float]) -> int:
        score = features["HR_Mean"] + features["GSR_peaks_per_min"] + features["Acc_jerk"]
        return int(score) % 3


@dataclass
class FakeClock:
    current: datetime

    def now(self) -> datetime:
        return self.current

    def advance(self, seconds: float) -> datetime:
        self.current = self.current + timedelta(seconds=seconds)
        return self.current


def _sample(index: int) -> dict[str, float]:
    return {
        "HR": 72.0 + (index % 6),
        "GSR": 0.3 + 0.02 * np.sin(index / 4.0),
        "ax": 0.01 * index,
        "ay": 0.015 * index,
        "az": 0.02 * index,
        "vx": 0.0,
        "vy": 0.0,
        "vz": 0.0,
    }


def main() -> None:
    clock = FakeClock(datetime.now(timezone.utc) - timedelta(seconds=70))
    pipeline = RealtimeSensorPipeline(model_hook=DummyModelHook(), clock=clock.now, auto_snapshot=False)

    saved_rows = 0
    for index in range(70):
        result = pipeline.on_new_sample(_sample(index))
        if result is not None:
            saved_rows += 1
            print(f"Saved row {saved_rows}: {result['timestamp']} -> prediction {result['model_prediction']}")
        clock.advance(1.0)

    print(f"Smoke test complete. Saved {saved_rows} prediction rows.")


if __name__ == "__main__":
    main()
