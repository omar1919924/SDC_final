from __future__ import annotations

from pathlib import Path
from typing import Optional

import joblib
import numpy as np
import torch
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score
from sklearn.preprocessing import StandardScaler
from sklearn.utils.class_weight import compute_class_weight
from torch.utils.data import DataLoader, TensorDataset

from config import BATCH_SIZE, CLASSES, SCALER_SAVE_PATH


class NumpyDataset(TensorDataset):
    def __init__(self, x: np.ndarray, y: np.ndarray) -> None:
        features = torch.tensor(x, dtype=torch.float32)
        labels = torch.tensor(y, dtype=torch.long)
        super().__init__(features, labels)


def compute_class_weights(y: np.ndarray) -> torch.Tensor:
    weights = compute_class_weight(class_weight="balanced", classes=np.array(CLASSES), y=y)
    return torch.tensor(weights, dtype=torch.float32)


def get_dataloader(
    x: np.ndarray,
    y: np.ndarray,
    batch_size: int = BATCH_SIZE,
    shuffle: bool = True,
    scaler: Optional[StandardScaler] = None,
    fit_scaler: bool = True,
    save_scaler: bool = False,
) -> tuple[DataLoader, StandardScaler]:
    if scaler is None:
        scaler = StandardScaler()

    if fit_scaler:
        x_scaled = scaler.fit_transform(x)
    else:
        x_scaled = scaler.transform(x)

    if save_scaler:
        Path(SCALER_SAVE_PATH).parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(scaler, SCALER_SAVE_PATH)

    dataset = NumpyDataset(x_scaled.astype(np.float32), y.astype(np.int64))
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=shuffle)
    return dataloader, scaler


def train_one_epoch(
    model: torch.nn.Module,
    dataloader: DataLoader,
    optimizer: torch.optim.Optimizer,
    criterion: torch.nn.Module,
    device: str = "cpu",
) -> float:
    model.train()
    total_loss = 0.0
    total_batches = 0

    for features, labels in dataloader:
        features = features.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        logits = model(features)
        loss = criterion(logits, labels)
        loss.backward()
        optimizer.step()

        total_loss += float(loss.item())
        total_batches += 1

    if total_batches == 0:
        return 0.0
    return total_loss / total_batches


def evaluate(
    model: torch.nn.Module,
    dataloader: DataLoader,
    criterion: Optional[torch.nn.Module] = None,
    device: str = "cpu",
) -> dict:
    model.eval()
    all_preds: list[int] = []
    all_labels: list[int] = []
    loss_total = 0.0
    batches = 0

    with torch.no_grad():
        for features, labels in dataloader:
            features = features.to(device)
            labels = labels.to(device)
            logits = model(features)

            if criterion is not None:
                loss_total += float(criterion(logits, labels).item())
            batches += 1

            preds = torch.argmax(logits, dim=1)
            all_preds.extend(preds.cpu().numpy().tolist())
            all_labels.extend(labels.cpu().numpy().tolist())

    if not all_labels:
        return {
            "accuracy": 0.0,
            "f1_macro": 0.0,
            "f1_per_class": [0.0, 0.0, 0.0],
            "loss": 0.0,
        }

    accuracy = accuracy_score(all_labels, all_preds)
    f1_macro = f1_score(all_labels, all_preds, average="macro", labels=CLASSES, zero_division=0)
    f1_per_class = f1_score(
        all_labels,
        all_preds,
        average=None,
        labels=CLASSES,
        zero_division=0,
    ).tolist()

    cm = confusion_matrix(all_labels, all_preds, labels=CLASSES)
    print("Confusion matrix:")
    print(cm)

    avg_loss = loss_total / batches if batches > 0 else 0.0

    return {
        "accuracy": float(accuracy),
        "f1_macro": float(f1_macro),
        "f1_per_class": [float(x) for x in f1_per_class],
        "loss": float(avg_loss),
    }
