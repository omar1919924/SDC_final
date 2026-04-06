from __future__ import annotations

from collections.abc import Sequence

import pandas as pd

SENSOR_COLUMNS = ["heart_rate", "acceleration", "gsr"]


def _ensure_time_order(dataframe: pd.DataFrame) -> pd.DataFrame:
    data = dataframe.copy()
    data["timestamp"] = pd.to_datetime(data["timestamp"])
    data = data.sort_values("timestamp").reset_index(drop=True)
    return data


def build_window_features(dataframe: pd.DataFrame, window_size: int) -> pd.DataFrame:
    if window_size < 2:
        raise ValueError("window_size must be at least 2")

    data = _ensure_time_order(dataframe)

    feature_frame = pd.DataFrame(index=data.index)

    for column in SENSOR_COLUMNS:
        rolling = data[column].rolling(window=window_size, min_periods=window_size)
        feature_frame[f"{column}_mean"] = rolling.mean()
        feature_frame[f"{column}_std"] = rolling.std(ddof=0)
        feature_frame[f"{column}_min"] = rolling.min()
        feature_frame[f"{column}_max"] = rolling.max()
        feature_frame[f"{column}_slope"] = data[column].diff(periods=window_size - 1)

    timestamp_seconds = data["timestamp"].astype("int64") // 10**9
    feature_frame["dt_seconds"] = timestamp_seconds.diff().fillna(0)

    feature_frame = feature_frame.fillna(0.0)

    if "concentration_level" in data.columns:
        feature_frame["concentration_level"] = data["concentration_level"].values

    return feature_frame


def feature_columns() -> Sequence[str]:
    columns: list[str] = []
    for column in SENSOR_COLUMNS:
        columns.extend(
            [
                f"{column}_mean",
                f"{column}_std",
                f"{column}_min",
                f"{column}_max",
                f"{column}_slope",
            ]
        )
    columns.append("dt_seconds")
    return columns
