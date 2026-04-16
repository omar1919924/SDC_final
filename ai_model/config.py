from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
DATA_DIR = ROOT_DIR / "data"
MODEL_DIR = ROOT_DIR / "model"
MODEL_SAVED_DIR = MODEL_DIR / "saved"
LOGS_DIR = ROOT_DIR / "logs"

CORESET_SOURCE = DATA_DIR / "synthetic_concentration_full.csv"
CORE_SET = DATA_DIR / "core_set.csv"
NEW_FEEDBACK = DATA_DIR / "new_feedback.csv"
PERSONAL_HISTORY = DATA_DIR / "personal_history.csv"
RETRAINING_BATCH = DATA_DIR / "retraining_batch.csv"
MODEL_SAVE_PATH = MODEL_SAVED_DIR / "global_model.pt"
SCALER_SAVE_PATH = MODEL_SAVED_DIR / "scaler.pkl"
RETRAIN_LOG_PATH = LOGS_DIR / "retrain_log.csv"
PIPELINE_LOCK_FILE = LOGS_DIR / ".pipeline_running"

FEATURES = [
    "HR_Mean",
    "HRV",
    "GSR_peaks_per_min",
    "GSR_slope",
    "Acc_magnitude_mean",
    "Acc_magnitude_std",
    "Acc_jerk",
]
LABEL = "stress_level"
CLASSES = [0, 1, 2]
ALL_COLUMNS = FEATURES + [LABEL]

FEEDBACK_THRESHOLD = 20

NEW_FEEDBACK_SIZE = 20
CORESET_SIZE_ROUND1 = 40
CORESET_SIZE_DEFAULT = 20
PERSONAL_HIST_SIZE = 40
CORE_SET_TOTAL_SIZE = 300

VALIDATION_SPLIT = 0.20
MIN_HISTORY_FOR_VALIDATION = 10

EPOCHS = 10
LR = 0.001
BATCH_SIZE = 16

SERVER_ADDRESS = "localhost:8080"
NUM_ROUNDS = 1

LOG_COLUMNS = [
    "round",
    "timestamp",
    "n_new_feedback",
    "n_coreset",
    "n_personal_history",
    "val_accuracy",
    "val_f1_macro",
    "f1_class_0",
    "f1_class_1",
    "f1_class_2",
]
