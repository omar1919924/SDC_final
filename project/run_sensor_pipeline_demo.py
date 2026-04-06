from __future__ import annotations

import time

from sensor_pipeline.pipeline import RealtimeSensorPipeline


def _demo_sample(index: int) -> dict[str, float]:
    return {
        "HR": 75.0 + (index % 5),
        "GSR": 0.5 + (index % 7) * 0.03,
        "ax": 0.01 * index,
        "ay": 0.02 * index,
        "az": 0.015 * index,
        "vx": 0.0,
        "vy": 0.0,
        "vz": 0.0,
    }


def main() -> None:
    pipeline = RealtimeSensorPipeline(auto_snapshot=True)

    print("Starting autonomous demo stream (1 sample/second). Press Ctrl+C to stop.")
    index = 0
    try:
        while True:
            sample = _demo_sample(index)
            pipeline.on_new_sample(sample)
            index += 1
            time.sleep(1.0)
    except KeyboardInterrupt:
        print("Stopping autonomous demo.")
    finally:
        pipeline.stop()

    print("Demo complete.")


if __name__ == "__main__":
    main()
