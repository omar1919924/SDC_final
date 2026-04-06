from __future__ import annotations

import flwr as fl

from config import NUM_ROUNDS


def _weighted_average(metrics):
    if not metrics:
        return {}

    total_examples = sum(num_examples for num_examples, _ in metrics)
    if total_examples == 0:
        return {}

    output = {}
    for key in ["accuracy", "f1_macro", "f1_class_0", "f1_class_1", "f1_class_2"]:
        output[key] = sum(
            num_examples * float(metric_dict.get(key, 0.0))
            for num_examples, metric_dict in metrics
        ) / total_examples
    return output


def server_fn(context: fl.common.Context) -> fl.server.ServerAppComponents:
    num_rounds = int(context.run_config.get("num-server-rounds", NUM_ROUNDS))

    strategy = fl.server.strategy.FedAvg(
        min_fit_clients=1,
        min_evaluate_clients=1,
        min_available_clients=1,
        evaluate_metrics_aggregation_fn=_weighted_average,
    )

    config = fl.server.ServerConfig(num_rounds=num_rounds)
    return fl.server.ServerAppComponents(strategy=strategy, config=config)


app = fl.server.ServerApp(server_fn=server_fn)
