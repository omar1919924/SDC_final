from __future__ import annotations

from collections import OrderedDict

import numpy as np
import torch
import torch.nn as nn


class StressMLP(nn.Module):
    def __init__(self, input_dim: int = 7, num_classes: int = 3) -> None:
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(32, num_classes),
        )

    def forward(self, inputs: torch.Tensor) -> torch.Tensor:
        return self.network(inputs)

    def predict_proba(self, inputs: torch.Tensor) -> torch.Tensor:
        logits = self.forward(inputs)
        return torch.softmax(logits, dim=1)

    def get_parameters(self) -> list[np.ndarray]:
        return [
            parameter.detach().cpu().numpy()
            for _, parameter in self.state_dict().items()
        ]

    def set_parameters(self, parameters: list[np.ndarray]) -> None:
        state_dict_keys = list(self.state_dict().keys())
        if len(parameters) != len(state_dict_keys):
            raise ValueError(
                f"Expected {len(state_dict_keys)} parameters, got {len(parameters)}"
            )

        new_state_dict = OrderedDict(
            {
                key: torch.tensor(value)
                for key, value in zip(state_dict_keys, parameters, strict=True)
            }
        )
        self.load_state_dict(new_state_dict, strict=True)
