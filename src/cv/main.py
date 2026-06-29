import asyncio
import logging
import grpc
from concurrent import futures

# Placeholder imports until we generate the proto via grpcio-tools
# import cv_pb2_grpc

from api.grpc_server import CVServiceServicer

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("CrowdFlow.CV")

async def serve():
    logger.info("Starting CrowdFlow CV Service...")
    
    server = grpc.aio.server(futures.ThreadPoolExecutor(max_workers=10))
    
    # In a real environment with generated protos:
    # cv_pb2_grpc.add_CVServiceServicer_to_server(CVServiceServicer(), server)
    
    listen_addr = '[::]:9003'
    server.add_insecure_port(listen_addr)
    
    logger.info(f"gRPC CV Server listening on {listen_addr}")
    await server.start()
    
    try:
        await server.wait_for_termination()
    except KeyboardInterrupt:
        logger.info("Shutting down CV Service...")
        await server.stop(0)

if __name__ == '__main__':
    asyncio.run(serve())
