from __future__ import annotations

from datetime import datetime, timedelta, timezone
from threading import Event, Lock, Thread
from typing import Any, Callable, Optional

import sys
from pathlib import Path

# Add parent directory to path for config import
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import PIPELINE_LOCK_FILE

from .buffering import RollingSensorBuffer, SensorFrame
from .features import extract_features
from .model_hook import StressModelHook
from .storage import append_prediction, ensure_storage_files, save_feedback as save_feedback_entry


class RealtimeSensorPipeline:
    def __init__(
        self,
        window_seconds: int = 60,
        snapshot_interval_seconds: int = 30,
        minimum_samples: int = 10,
        model_hook: StressModelHook | None = None,
        clock: Callable[[], datetime] | None = None,
        auto_snapshot: bool = True,
        scheduler_interval_seconds: float = 0.5,
    ) -> None:
        ensure_storage_files()
        self.lock = Lock()
        self.buffer = RollingSensorBuffer(window_seconds=window_seconds)
        self.snapshot_interval = timedelta(seconds=snapshot_interval_seconds)
        self.minimum_samples = minimum_samples
        self.model_hook = model_hook or StressModelHook()
        self._clock = clock or (lambda: datetime.now(timezone.utc))
        self.auto_snapshot = auto_snapshot
        self.scheduler_interval_seconds = float(max(0.1, scheduler_interval_seconds))
        self._last_snapshot_time: datetime | None = None
        self._first_sample_time: datetime | None = None
        self._stop_event = Event()
        self._scheduler_thread: Thread | None = None

        if self.auto_snapshot:
            self.start()

    def _coerce_sample(self, sample: dict[str, Any]) -> SensorFrame:
        try:
            return SensorFrame(
                timestamp=self._clock(),
                hr=float(sample["HR"]),
                gsr=float(sample["GSR"]),
                ax=float(sample["ax"]),
                ay=float(sample["ay"]),
                az=float(sample["az"]),
            )
        except KeyError as exc:
            raise KeyError(f"Missing required sample field: {exc.args[0]}") from exc

    def _should_snapshot(self, now: datetime) -> bool:
        if len(self.buffer) < self.minimum_samples:
            return False

        if self._last_snapshot_time is None:
            if self._first_sample_time is None:
                return False
            elapsed_since_first = (now - self._first_sample_time).total_seconds()
            return elapsed_since_first >= float(self.buffer.window_seconds)
        return now - self._last_snapshot_time >= self.snapshot_interval

    def _predict_and_store_locked(self, now: datetime) -> Optional[dict[str, Any]]:
        frames = self.buffer.snapshot(now)
        if len(frames) < self.minimum_samples:
            return None

        features = extract_features(frames, snapshot_time=now)
        feature_dict = features.as_dict()
        prediction = self.model_hook.predict(feature_dict)
        saved_row = append_prediction(feature_dict, prediction, timestamp=now)
        self._last_snapshot_time = now
        return saved_row

    def _scheduler_loop(self) -> None:
        while not self._stop_event.is_set():
            with self.lock:
                now = self._clock()
                self.buffer.prune(now)
                if self._should_snapshot(now):
                    self._predict_and_store_locked(now)
            self._stop_event.wait(self.scheduler_interval_seconds)

    def start(self) -> None:
        if self._scheduler_thread is not None and self._scheduler_thread.is_alive():
            return
        self._stop_event.clear()
        PIPELINE_LOCK_FILE.parent.mkdir(parents=True, exist_ok=True)
        PIPELINE_LOCK_FILE.touch()
        self._scheduler_thread = Thread(target=self._scheduler_loop, name="sensor-pipeline-scheduler", daemon=True)
        self._scheduler_thread.start()

    def stop(self, timeout_seconds: float = 2.0) -> None:
        self._stop_event.set()
        if self._scheduler_thread is not None:
            self._scheduler_thread.join(timeout=timeout_seconds)
        try:
            PIPELINE_LOCK_FILE.unlink(missing_ok=True)
        except Exception as e:
            print(f"[Pipeline] Warning: Could not remove lock file: {e}")

    def on_new_sample(self, sample: dict[str, Any]) -> Optional[dict[str, Any]]:
        frame = self._coerce_sample(sample)

        with self.lock:
            self.buffer.append(frame)
            now = frame.timestamp
            if self._first_sample_time is None:
                self._first_sample_time = now
            self.buffer.prune(now)

            if self.auto_snapshot:
                return None

            if not self._should_snapshot(now):
                return None

            saved_row = self._predict_and_store_locked(now)

        return saved_row

    def save_feedback(self, entry: dict[str, Any], teacher_label: int) -> dict[str, Any]:
        with self.lock:
            return save_feedback_entry(entry, teacher_label)


_DEFAULT_PIPELINE: RealtimeSensorPipeline | None = None


def get_default_pipeline() -> RealtimeSensorPipeline:
    global _DEFAULT_PIPELINE
    if _DEFAULT_PIPELINE is None:
        _DEFAULT_PIPELINE = RealtimeSensorPipeline()
    return _DEFAULT_PIPELINE


def on_new_sample(sample: dict[str, Any]) -> Optional[dict[str, Any]]:
    return get_default_pipeline().on_new_sample(sample)


def save_feedback(entry: dict[str, Any], teacher_label: int) -> dict[str, Any]:
    return get_default_pipeline().save_feedback(entry, teacher_label)
