import torch
import torch.nn as nn
from torch_geometric.nn import GCNConv

class SpatioTemporalGNN(nn.Module):
    def __init__(self, num_nodes, in_channels, hidden_channels, out_channels):
        super(SpatioTemporalGNN, self).__init__()
        
        # Spatial feature extraction using Graph Convolution
        self.gcn = GCNConv(in_channels, hidden_channels)
        
        # Temporal feature extraction using GRU
        self.gru = nn.GRU(hidden_channels, hidden_channels, batch_first=True)
        
        # Prediction layer
        self.linear = nn.Linear(hidden_channels, out_channels)

    def forward(self, x, edge_index):
        # x shape: (batch_size, seq_len, num_nodes, in_channels)
        batch_size, seq_len, num_nodes, in_channels = x.size()
        
        # Reshape for GCN: process each time step
        # Target shape: (batch_size * seq_len * num_nodes, in_channels)
        x_reshaped = x.view(-1, in_channels)
        
        # Pass through GCN
        spatial_features = self.gcn(x_reshaped, edge_index)
        spatial_features = torch.relu(spatial_features)
        
        # Reshape for GRU: (batch_size * num_nodes, seq_len, hidden_channels)
        spatial_features = spatial_features.view(batch_size, seq_len, num_nodes, -1)
        spatial_features = spatial_features.permute(0, 2, 1, 3).contiguous()
        spatial_features = spatial_features.view(batch_size * num_nodes, seq_len, -1)
        
        # Pass through GRU
        gru_out, _ = self.gru(spatial_features)
        
        # We take the output of the last time step for prediction
        last_out = gru_out[:, -1, :]
        
        # Pass through final linear layer
        out = self.linear(last_out)
        
        # Reshape back to (batch_size, num_nodes, out_channels)
        out = out.view(batch_size, num_nodes, -1)
        
        return out
