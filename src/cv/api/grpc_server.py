import logging
from typing import AsyncIterable

# Placeholder for generated protos
# import cv_pb2
# import cv_pb2_grpc

from models.detector import ObjectDetector
from core.webrtc import WebRTCManager

logger = logging.getLogger("CrowdFlow.CV.GRPC")

# class CVServiceServicer(cv_pb2_grpc.CVServiceServicer):
class CVServiceServicer:
    def __init__(self):
        self.detector = ObjectDetector()
        self.webrtc_manager = WebRTCManager(self.detector)

    async def StreamAnalysis(self, request_iterator, context):
        """
        Bidirectional streaming RPC
        """
        async for request in request_iterator:
            device_id = getattr(request, 'device_id', 'unknown')
            
            # Check the oneof payload
            # In real proto: request.WhichOneof('payload')
            
            # Scaffold: Handle Frame
            if hasattr(request, 'frame') and request.frame:
                detections = self.detector.process_frame(request.frame)
                
                # Yield response
                # yield cv_pb2.StreamAnalysisResponse(detections=...)
                pass
                
            # Scaffold: Handle WebRTC
            elif hasattr(request, 'webrtc_sdp') and request.webrtc_sdp:
                answer_sdp = await self.webrtc_manager.handle_offer(request.webrtc_sdp, device_id)
                # yield cv_pb2.StreamAnalysisResponse(webrtc_sdp_answer=answer_sdp)
                pass
