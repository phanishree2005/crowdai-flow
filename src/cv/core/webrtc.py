import json
import logging
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack

logger = logging.getLogger("CrowdFlow.WebRTC")

class WebRTCManager:
    def __init__(self, detector):
        self.pcs = set()
        self.detector = detector

    async def handle_offer(self, offer_sdp: str, device_id: str) -> str:
        """
        Process an incoming SDP offer and return the SDP answer.
        """
        offer = RTCSessionDescription(sdp=offer_sdp, type="offer")
        pc = RTCPeerConnection()
        self.pcs.add(pc)

        @pc.on("connectionstatechange")
        async def on_connectionstatechange():
            logger.info(f"WebRTC Connection State for {device_id} is {pc.connectionState}")
            if pc.connectionState == "failed" or pc.connectionState == "closed":
                self.pcs.discard(pc)

        @pc.on("track")
        def on_track(track):
            logger.info(f"Track {track.kind} received from {device_id}")
            if track.kind == "video":
                # Handle video frames
                pass

            @track.on("ended")
            async def on_ended():
                logger.info(f"Track {track.kind} ended")

        await pc.setRemoteDescription(offer)
        
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        return pc.localDescription.sdp
