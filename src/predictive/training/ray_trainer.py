import ray
from ray import train, tune
from ray.train import Checkpoint
from ray.train.torch import TorchTrainer
from ray.train import ScalingConfig

import torch
import torch.nn as nn
import torch.optim as optim

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from models.st_gnn import SpatioTemporalGNN

def train_func(config):
    # Retrieve hyperparameters
    lr = config.get("lr", 1e-3)
    hidden_channels = config.get("hidden_channels", 64)
    
    # Mock data dimensions for scaffolding
    num_nodes = 100
    in_channels = 2
    out_channels = 2
    
    model = SpatioTemporalGNN(num_nodes, in_channels, hidden_channels, out_channels)
    
    # Ray Train prepares the model for distributed training (DDP)
    model = train.torch.prepare_model(model)
    
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    
    # Dummy training loop
    for epoch in range(10):
        # In a real scenario, fetch batches from a Ray Dataset
        # Scaffold with dummy data
        batch_size = 32
        seq_len = 12
        x = torch.randn(batch_size, seq_len, num_nodes, in_channels)
        y = torch.randn(batch_size, num_nodes, out_channels)
        edge_index = torch.randint(0, num_nodes, (2, 500))
        
        optimizer.zero_grad()
        output = model(x, edge_index)
        loss = criterion(output, y)
        loss.backward()
        optimizer.step()
        
        # Report metrics and checkpoint to Ray
        train.report({"loss": loss.item()})

if __name__ == "__main__":
    ray.init(ignore_reinit_error=True)
    
    scaling_config = ScalingConfig(
        num_workers=2, 
        use_gpu=torch.cuda.is_available()
    )
    
    trainer = TorchTrainer(
        train_loop_per_worker=train_func,
        train_loop_config={"lr": 1e-3, "hidden_channels": 64},
        scaling_config=scaling_config,
    )
    
    result = trainer.fit()
    print(f"Training completed. Final loss: {result.metrics['loss']}")
