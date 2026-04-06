from __future__ import annotations

import sys
from pathlib import Path

import flwr as fl
import numpy as np
import pandas as pd
import torch
from torch import nn

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from config import BATCH_SIZE, CLASSES, EPOCHS, FEATURES, LABEL, LR, MODEL_SAVE_PATH, RETRAINING_BATCH, SCALER_SAVE_PATH, SERVER_ADDRESS
from data_manager import get_validation_set
from model.stress_mlp import StressMLP
from train_utils import compute_class_weights, evaluate, get_dataloader, train_one_epoch


class StressClient(fl.client.NumPyClient):
    def __init__(self) -> None:
        self.model = StressMLP(input_dim=len(FEATURES), num_classes=len(CLASSES))
        self.device = "cpu"
        self.model.to(self.device)

    def get_parameters(self, config):
        return self.model.get_parameters()

    def fit(self, parameters, config):
        self.model.set_parameters(parameters)

        train_df = pd.read_csv(RETRAINING_BATCH)
        train_df = train_df.dropna(subset=FEATURES + [LABEL])
        if train_df.empty:
            raise RuntimeError("retraining_batch.csv is empty; cannot train.")

        x_train = train_df[FEATURES].to_numpy(dtype=np.float32)
        y_train = train_df[LABEL].to_numpy(dtype=np.int64)

        train_loader, _ = get_dataloader(
            x_train,
            y_train,
            batch_size=BATCH_SIZE,
            shuffle=True,
            fit_scaler=True,
            save_scaler=True,
        )

        class_weights = compute_class_weights(y_train).to(self.device)
        criterion = nn.CrossEntropyLoss(weight=class_weights)
        optimizer = torch.optim.Adam(self.model.parameters(), lr=LR)

        epoch_loss = 0.0
        for _ in range(EPOCHS):
            epoch_loss = train_one_epoch(
                self.model,
                train_loader,
                optimizer,
                criterion,
                device=self.device,
            )

        Path(MODEL_SAVE_PATH).parent.mkdir(parents=True, exist_ok=True)
        torch.save(self.model.state_dict(), MODEL_SAVE_PATH)

        metrics = {
            "train_loss": float(epoch_loss),
            "num_examples": int(len(train_df)),
        }
        return self.model.get_parameters(), len(train_df), metrics

    def evaluate(self, parameters, config):
        self.model.set_parameters(parameters)

        validation = get_validation_set()
        if validation is None:
            return 0.0, 1, {
                "accuracy": 0.0,
                "f1_macro": 0.0,
                "f1_class_0": 0.0,
                "f1_class_1": 0.0,
                "f1_class_2": 0.0,
                "validation_skipped": 1.0,
            }

        x_val, y_val = validation

        if Path(SCALER_SAVE_PATH).exists():
            import joblib

            scaler = joblib.load(SCALER_SAVE_PATH)
            val_loader, _ = get_dataloader(
                x_val,
                y_val,
                batch_size=BATCH_SIZE,
                shuffle=False,
                scaler=scaler,
                fit_scaler=False,
                save_scaler=False,
            )
        else:
            val_loader, _ = get_dataloader(
                x_val,
                y_val,
                batch_size=BATCH_SIZE,
                shuffle=False,
                fit_scaler=True,
                save_scaler=False,
            )

        criterion = nn.CrossEntropyLoss()
        metrics = evaluate(self.model, val_loader, criterion=criterion, device=self.device)

        return metrics["loss"], len(y_val), {
            "accuracy": metrics["accuracy"],
            "f1_macro": metrics["f1_macro"],
            "f1_class_0": metrics["f1_per_class"][0],
            "f1_class_1": metrics["f1_per_class"][1],
            "f1_class_2": metrics["f1_per_class"][2],
        }


def main() -> None:
    client = StressClient()
    fl.client.start_numpy_client(server_address=SERVER_ADDRESS, client=client)


if __name__ == "__main__":
    main()
