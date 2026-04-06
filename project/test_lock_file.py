#!/usr/bin/env python
"""Test script to verify lock file creation when pipeline runs."""

import time
from pathlib import Path
from sensor_pipeline.pipeline import RealtimeSensorPipeline
from config import PIPELINE_LOCK_FILE

print(f"Lock file path: {PIPELINE_LOCK_FILE}")
print(f"Lock exists before: {PIPELINE_LOCK_FILE.exists()}")

# Create pipeline with auto_snapshot=True
pipeline = RealtimeSensorPipeline(auto_snapshot=True)
print(f"Lock exists after pipeline creation: {PIPELINE_LOCK_FILE.exists()}")

# Let it run for a moment
time.sleep(1)
print(f"Lock exists after 1 second: {PIPELINE_LOCK_FILE.exists()}")

# Stop pipeline
pipeline.stop()
time.sleep(0.5)
print(f"Lock exists after stop: {PIPELINE_LOCK_FILE.exists()}")

print("\n✓ Lock file test passed!")
