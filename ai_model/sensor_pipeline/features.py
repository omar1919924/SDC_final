from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

import numpy as np

from .buffering import SensorFrame


@dataclass(frozen=True)
class ExtractedFeatures:
    timestamp: str
    HR_Mean: float
    HRV: float
    GSR_peaks_per_min: float
    GSR_slope: float
    Acc_magnitude_mean: float
    Acc_magnitude_std: float
    Acc_jerk: float

    def as_dict(self) -> dict[str, float | str]:
        return {
            "timestamp": self.timestamp,
            "HR_Mean": self.HR_Mean,
            "HRV": self.HRV,
            "GSR_peaks_per_min": self.GSR_peaks_per_min,
            "GSR_slope": self.GSR_slope,
            "Acc_magnitude_mean": self.Acc_magnitude_mean,
            "Acc_magnitude_std": self.Acc_magnitude_std,
            "Acc_jerk": self.Acc_jerk,
        }


def _frame_time_seconds(frames: list[SensorFrame]) -> np.ndarray:
    start = frames[0].timestamp
    return np.array([(frame.timestamp - start).total_seconds() for frame in frames], dtype=np.float64)


def _count_local_maxima(values: np.ndarray) -> int:
    if values.size < 3:
        return 0
    peaks = 0
    for index in range(1, values.size - 1):
        if values[index] > values[index - 1] and values[index] > values[index + 1]:
            peaks += 1
    return peaks


def _calculate_hrv_from_hr(hr_values: np.ndarray) -> float:
    if hr_values.size < 2:
        return 0.0
    hr_values = np.clip(hr_values.astype(np.float64), 1e-6, None)
    rr_intervals = 60.0 / hr_values
    rr_deltas = np.diff(rr_intervals)
    if rr_deltas.size == 0:
        return 0.0
    return float(np.sqrt(np.mean(rr_deltas**2)))


def extract_features(frames: list[SensorFrame], snapshot_time: datetime) -> ExtractedFeatures:
    if not frames:
        raise ValueError("Cannot extract features from an empty frame window.")

    timestamps = np.array([frame.timestamp.timestamp() for frame in frames], dtype=np.float64)
    hr_values = np.array([frame.hr for frame in frames], dtype=np.float64)
    gsr_values = np.array([frame.gsr for frame in frames], dtype=np.float64)
    ax_values = np.array([frame.ax for frame in frames], dtype=np.float64)
    ay_values = np.array([frame.ay for frame in frames], dtype=np.float64)
    az_values = np.array([frame.az for frame in frames], dtype=np.float64)

    acc_magnitude = np.sqrt(ax_values**2 + ay_values**2 + az_values**2)
    relative_time = timestamps - timestamps[0]

    if relative_time.size >= 2 and np.ptp(relative_time) > 0:
        gsr_slope = float(np.polyfit(relative_time, gsr_values, 1)[0])
        duration_seconds = float(relative_time[-1] - relative_time[0])
    else:
        gsr_slope = 0.0
        duration_seconds = 0.0

    duration_minutes = max(duration_seconds / 60.0, 1.0 / 60.0)
    gsr_peaks_per_min = float(_count_local_maxima(gsr_values) / duration_minutes)

    if acc_magnitude.size >= 2:
        acc_time_delta = np.diff(relative_time)
        acc_delta = np.diff(acc_magnitude)
        valid = acc_time_delta > 0
        if np.any(valid):
            jerk_samples = np.abs(acc_delta[valid] / acc_time_delta[valid])
            acc_jerk = float(np.mean(jerk_samples)) if jerk_samples.size else 0.0
        else:
            acc_jerk = 0.0
    else:
        acc_jerk = 0.0

    features = ExtractedFeatures(
        timestamp=snapshot_time.isoformat(),
        HR_Mean=float(np.mean(hr_values)),
        HRV=_calculate_hrv_from_hr(hr_values),
        GSR_peaks_per_min=gsr_peaks_per_min,
        GSR_slope=gsr_slope,
        Acc_magnitude_mean=float(np.mean(acc_magnitude)),
        Acc_magnitude_std=float(np.std(acc_magnitude, ddof=0)),
        Acc_jerk=acc_jerk,
    )
    return features
