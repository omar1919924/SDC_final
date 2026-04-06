#!/usr/bin/env python
"""Test that retrain_trigger.py respects the pipeline lock."""

import pandas as pd
from pathlib import Path
from config import NEW_FEEDBACK, PIPELINE_LOCK_FILE

# Create dummy feedback
dummy_data = pd.DataFrame({
    'HR_Mean': [70.5] * 25,
    'HRV': [15.2] * 25,
    'GSR_peaks_per_min': [10.5] * 25,
    'GSR_slope': [0.1] * 25,
    'Acc_magnitude_mean': [0.95] * 25,
    'Acc_magnitude_std': [0.2] * 25,
    'Acc_jerk': [0.5] * 25,
    'stress_level': [1] * 25,
})
NEW_FEEDBACK.parent.mkdir(parents=True, exist_ok=True)
dummy_data.to_csv(NEW_FEEDBACK, index=False)

# Create lock file
PIPELINE_LOCK_FILE.parent.mkdir(parents=True, exist_ok=True)
PIPELINE_LOCK_FILE.touch()

print("=== Testing retrain_trigger with pipeline lock active ===\n")

# Import after creating files so retrain_trigger sees them
from retrain_trigger import main

main()

# Cleanup
PIPELINE_LOCK_FILE.unlink()
print("\n✓ Test complete")
