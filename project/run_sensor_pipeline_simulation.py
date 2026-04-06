from __future__ import annotations

import argparse
import math
import random
import time
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sensor_pipeline.features import extract_features
from sensor_pipeline.pipeline import RealtimeSensorPipeline
from sensor_pipeline.storage import append_prediction


class DummyModelHook:
    def predict(self, features: dict[str, float]) -> int:
        hr_score = (features["HR_Mean"] - 70.0) * 0.06
        gsr_score = features["GSR_peaks_per_min"] * 0.08
        jerk_score = features["Acc_jerk"] * 0.25
        score = hr_score + gsr_score + jerk_score
        if score < 2.0:
            return 0
        if score < 4.0:
            return 1
        return 2


@dataclass
class FakeClock:
    current: datetime

    def now(self) -> datetime:
        return self.current

    def advance(self, seconds: float) -> None:
        self.current = self.current + timedelta(seconds=seconds)


def _sensor_sample(elapsed_seconds: float, base_stress: float) -> dict[str, float]:
    hr = 72.0 + 10.0 * base_stress + 4.0 * math.sin(elapsed_seconds * 0.16) + random.uniform(-1.4, 1.4)
    gsr = 0.25 + 0.18 * base_stress + 0.05 * math.sin(elapsed_seconds * 0.23) + random.uniform(-0.02, 0.02)

    ax = 0.08 * math.sin(elapsed_seconds * 1.5) + 0.07 * base_stress + random.uniform(-0.015, 0.015)
    ay = 0.06 * math.cos(elapsed_seconds * 1.2) + 0.05 * base_stress + random.uniform(-0.015, 0.015)
    az = 0.95 + 0.04 * math.sin(elapsed_seconds * 0.8) + 0.09 * base_stress + random.uniform(-0.02, 0.02)

    return {
        "HR": max(45.0, hr),
        "GSR": max(0.0, gsr),
        "ax": ax,
        "ay": ay,
        "az": az,
        "vx": 0.0,
        "vy": 0.0,
        "vz": 0.0,
    }


def _stress_profile(progress: float) -> float:
    if progress < 0.35:
        return 0.2
    if progress < 0.7:
        return 0.55
    return 0.85


def run_simulation(
    seconds: int,
    hz: float,
    realtime: bool,
    use_dummy_model: bool,
    verbose: bool,
    manual_step: bool,
    save_every_sample_to_main: bool,
) -> None:
    random.seed(42)
    dt = 1.0 / hz
    total_samples = max(1, int(seconds * hz))

    auto_snapshot = realtime and (not manual_step)

    if realtime:
        pipeline = RealtimeSensorPipeline(
            auto_snapshot=auto_snapshot,
            model_hook=DummyModelHook() if use_dummy_model else None,
        )
        clock = None
    else:
        clock = FakeClock(datetime.now(timezone.utc) - timedelta(seconds=seconds + 2))
        pipeline = RealtimeSensorPipeline(
            auto_snapshot=auto_snapshot,
            clock=clock.now,
            model_hook=DummyModelHook() if use_dummy_model else None,
        )

    saved_entries = 0
    saved_sample_rows = 0
    print(
        f"Starting simulation | seconds={seconds} | hz={hz} | realtime={realtime} | "
        f"auto_snapshot={auto_snapshot} | verbose={verbose}"
    )

    if realtime and auto_snapshot and verbose:
        print(
            "[trace] realtime + auto snapshot enabled: prediction rows are created by "
            "the background scheduler every 30s."
        )

    try:
        for sample_index in range(total_samples):
            progress = sample_index / max(1, total_samples - 1)
            base_stress = _stress_profile(progress)
            elapsed_seconds = sample_index * dt

            sample = _sensor_sample(elapsed_seconds, base_stress)
            if verbose:
                print(
                    f"[sample {sample_index + 1}/{total_samples}] "
                    f"t={elapsed_seconds:6.2f}s "
                    f"HR={sample['HR']:.2f} GSR={sample['GSR']:.3f} "
                    f"acc=({sample['ax']:.3f},{sample['ay']:.3f},{sample['az']:.3f})"
                )

            if verbose:
                print("  -> feeding sample to pipeline via on_new_sample(...) ...")

            result = pipeline.on_new_sample(sample)

            if save_every_sample_to_main:
                with pipeline.lock:
                    now_for_sample = pipeline._clock()
                    frames = pipeline.buffer.snapshot(now_for_sample)

                if len(frames) >= pipeline.minimum_samples:
                    sample_features = extract_features(frames, snapshot_time=now_for_sample).as_dict()
                    sample_prediction = pipeline.model_hook.predict(sample_features)
                    append_prediction(sample_features, sample_prediction, timestamp=now_for_sample)
                    saved_sample_rows += 1
                    if verbose:
                        print(
                            f"  -> sample-row saved [{saved_sample_rows}] prediction={sample_prediction} "
                            f"timestamp={sample_features['timestamp']}"
                        )
                elif verbose:
                    print("  -> sample-row skipped (not enough buffered samples yet)")

            if result is not None:
                saved_entries += 1
                print(
                    f"  -> snapshot saved [{saved_entries}] prediction={result['model_prediction']} "
                    f"HR_mean={result['HR_Mean']:.2f} "
                    f"GSR_peaks/min={result['GSR_peaks_per_min']:.2f} "
                    f"timestamp={result['timestamp']}"
                )
                print("------------------------")
            elif verbose:
                print("  -> no snapshot output yet (buffer not ready or interval not reached)")

            if realtime:
                if verbose:
                    print(f"  -> sleeping {dt:.3f}s to mimic sensor cadence")
                time.sleep(dt)
            else:
                clock.advance(dt)
                if verbose:
                    print(f"  -> virtual clock advanced by {dt:.3f}s")

        print(
            f"Simulation complete. Saved {saved_entries} snapshot entries and "
            f"{saved_sample_rows} sample-derived entries to data/main_dataset.csv"
        )
    finally:
        pipeline.stop()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Simulate bracelet sensor samples and feed the pipeline")
    parser.add_argument("--seconds", type=int, default=120, help="Simulation duration in seconds")
    parser.add_argument("--hz", type=float, default=1.0, help="Samples per second")
    parser.add_argument(
        "--realtime",
        action="store_true",
        help="Use real wall-clock delays between samples",
    )
    parser.add_argument(
        "--use-dummy-model",
        action="store_true",
        help="Use built-in dummy model hook instead of trained model artifacts",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print step-by-step logs for every sample entry",
    )
    parser.add_argument(
        "--manual-step",
        action="store_true",
        help="Disable autonomous background snapshots so each sample step can show immediate snapshot checks",
    )
    parser.add_argument(
        "--no-save-every-sample",
        action="store_true",
        help="Disable per-sample persistence into main_dataset.csv",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    run_simulation(
        seconds=args.seconds,
        hz=args.hz,
        realtime=args.realtime,
        use_dummy_model=args.use_dummy_model,
        verbose=args.verbose,
        manual_step=args.manual_step,
        save_every_sample_to_main=not args.no_save_every_sample,
    )


if __name__ == "__main__":
    main()
