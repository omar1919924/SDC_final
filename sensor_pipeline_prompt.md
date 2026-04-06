# Copilot Prompt — Real-Time Sensor Data Pipeline

Build a real-time sensor data pipeline in Python for a child stress detection wearable bracelet.

---

## Context

A bracelet sends raw sensor samples once per heartbeat to a laptop. Each sample contains:
- `HR` (BPM)
- `GSR` (float)
- `ax`, `ay`, `az` (accelerometer)
- `vx`, `vy`, `vz` (velocity — **ignore these**)

The sensor input method is not decided yet, so abstract it behind a function called `on_new_sample(sample: dict)` that will be called externally whenever a new sample arrives.

---

## What the Pipeline Must Do

1. Maintain a rolling in-memory buffer (`deque`) that always holds the last **60 seconds** of samples, automatically dropping anything older
2. Every **30 seconds**, take a snapshot of the full 60-second buffer and extract these features into one flat dict:
   - `HR_mean`
   - `HRV` (RMSSD from RR intervals)
   - `GSR_peaks_per_min`
   - `GSR_slope`
   - `Acc_magnitude_mean`
   - `Acc_magnitude_std`
   - `Acc_jerk`
3. Pass the extracted features to a placeholder function `send_to_model(features: dict)` — do not implement the model, just the call
4. The pipeline must be **thread-safe** using a single threading lock since sensor reading and prediction may run on separate threads

---

## Storage

- Append every prediction entry to `main_dataset.csv` with columns:
  ```
  timestamp, HR_mean, HRV, GSR_peaks_per_min, GSR_slope, Acc_magnitude_mean, Acc_magnitude_std, Acc_jerk, model_prediction
  ```
  `model_prediction` will be filled externally after `send_to_model` returns — leave it as a parameter

- A separate function `save_feedback(entry: dict, teacher_label: int)` appends to `feedback_set.csv` with columns:
  ```
  timestamp, HR_mean, HRV, GSR_peaks_per_min, GSR_slope, Acc_magnitude_mean, Acc_magnitude_std, Acc_jerk, model_prediction, teacher_label
  ```

---

## Constraints

- Python only, `numpy` allowed, no `pandas` needed
- No files read during inference — everything in RAM
- Minimum **10 samples** in buffer before any prediction is attempted
- Clean separation between feature extraction, buffering, and storage — **three separate functions/modules**
