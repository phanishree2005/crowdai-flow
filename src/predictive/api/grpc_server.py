import logging
from typing import AsyncIterable

# import predictive_pb2
# import predictive_pb2_grpc

from models.st_gnn import SpatioTemporalGNN

logger = logging.getLogger("CrowdFlow.Predictive.GRPC")

# class PredictiveServiceServicer(predictive_pb2_grpc.PredictiveServiceServicer):
class PredictiveServiceServicer:
    def __init__(self):
        # Load the trained model from Ray checkpoints
        # For scaffold, instantiate an empty model
        self.model = SpatioTemporalGNN(num_nodes=100, in_channels=2, hidden_channels=64, out_channels=2)
        self.model.eval()

    async def ForecastCongestion(self, request, context):
        logger.info(f"Received forecast request for {len(request.geohashes)} geohashes")
        
        # Prepare inputs from request.context
        # Perform inference
        # dummy_output = self.model(...)
        
        # return predictive_pb2.ForecastResponse(forecasts=[...])
        pass
