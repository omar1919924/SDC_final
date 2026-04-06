# Federated ADHD Stress Detection (Prototype)

This project implements a single-client federated learning pipeline (Flower + PyTorch) for stress detection using 30-second windows.

## Dataset Schema

Each row must include these feature columns and one label:

- `HR_Mean`
- `HRV`
- `GSR_peaks_per_min`
- `GSR_slope`
- `Acc_magnitude_mean`
- `Acc_magnitude_std`
- `Acc_jerk`
- `stress_level` (0/1/2)

## Requirements

Install dependencies in your Python environment:

```powershell
pip install torch flwr pandas numpy scikit-learn joblib
```

## Project Layout

- `config.py`: constants and paths
- `data_manager.py`: dataset lifecycle and sampling
- `train_utils.py`: dataloaders, training, metrics
- `model/stress_mlp.py`: MLP model
- `federated/server.py`: Flower server
- `federated/client.py`: Flower client
- `retrain_trigger.py`: orchestrates one retraining round
- `sensor_pipeline/`: real-time buffering, feature extraction, storage, and model inference hook

## Setup

1. Place your source dataset at:
   - `data/synthetic_concentration_full.csv`
2. Ensure it includes all 7 features + `stress_level`.

## Run End-to-End

```powershell
# Step 1 — Initialize core set
python data_manager.py --init

# Step 2 — Simulate 20 teacher feedback entries
python data_manager.py --simulate-feedback 20

# Step 3 — Trigger retraining
python retrain_trigger.py
```

Expected style of output:

```text
Round 1 complete | samples: 60 | val_accuracy: X.XX | val_f1: X.XX
```

## Real-Time Sensor Pipeline

The realtime pipeline stores automatic predictions in `data/main_dataset.csv` and teacher corrections in `data/feedback_set.csv`.

Use it like this:

```python
from sensor_pipeline.pipeline import on_new_sample, save_feedback

sample = {
   "HR": 84.0,
   "GSR": 0.52,
   "ax": 0.01,
   "ay": 0.02,
   "az": 0.03,
   "vx": 0.0,
   "vy": 0.0,
   "vz": 0.0,
}

result = on_new_sample(sample)
if result is not None:
   print(result)
```

The pipeline uses wall-clock arrival time, keeps the latest 60 seconds in memory, and snapshots every 30 seconds once at least 10 samples are buffered.

For a no-model smoke check, run:

```powershell
python run_sensor_pipeline_smoke.py
```

## Notes

- `new_feedback.csv` always keeps headers, even when empty.
- If Flower subprocesses fail, reset is skipped to avoid data loss.
- Validation is skipped when personal history has fewer than 10 rows.
