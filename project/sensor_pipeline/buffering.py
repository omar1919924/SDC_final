from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Deque, Iterable


@dataclass(frozen=True)
class SensorFrame:
    timestamp: datetime
    hr: float
    gsr: float
    ax: float
    ay: float
    az: float


class RollingSensorBuffer:
    def __init__(self, window_seconds: int = 60) -> None:
        self.window_seconds = window_seconds
        self._frames: Deque[SensorFrame] = deque()

    def append(self, frame: SensorFrame) -> None:
        self._frames.append(frame)
        self.prune()

    def prune(self, now: datetime | None = None) -> None:
        now = now or datetime.now(timezone.utc)
        cutoff = now - timedelta(seconds=self.window_seconds)
        while self._frames and self._frames[0].timestamp < cutoff:
            self._frames.popleft()

    def snapshot(self, now: datetime | None = None) -> list[SensorFrame]:
        self.prune(now=now)
        return list(self._frames)

    def __len__(self) -> int:
        return len(self._frames)

    def __iter__(self) -> Iterable[SensorFrame]:
        return iter(self._frames)
