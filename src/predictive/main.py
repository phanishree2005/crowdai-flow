import asyncio
import logging
import grpc
from concurrent import futures
import ray

# from api.grpc_server import PredictiveServiceServicer
# import predictive_pb2_grpc

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("CrowdFlow.Predictive")

async def serve():
    logger.info("Starting CrowdFlow Predictive Service...")
    
    # Initialize Ray connection (connects to cluster if available, else local)
    ray.init(ignore_reinit_error=True)
    logger.info("Ray cluster connected successfully.")

    server = grpc.aio.server(futures.ThreadPoolExecutor(max_workers=10))
    
    # In a real environment with generated protos:
    # predictive_pb2_grpc.add_PredictiveServiceServicer_to_server(PredictiveServiceServicer(), server)
    
    listen_addr = '[::]:9004'
    server.add_insecure_port(listen_addr)
    
    logger.info(f"gRPC Predictive Server listening on {listen_addr}")
    await server.start()
    
    try:
        await server.wait_for_termination()
    except KeyboardInterrupt:
        logger.info("Shutting down Predictive Service...")
        ray.shutdown()
        await server.stop(0)

if __name__ == '__main__':
    asyncio.run(serve())
