const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  const lowercaseMsg = message.toLowerCase();
  
  let response = "I'm analyzing the telemetry data streams, but I need more specific parameters to execute that request.";
  
  if (lowercaseMsg.includes("rerouting") || lowercaseMsg.includes("zone alpha")) {
    response = "Analyzing multi-modal streams... Zone Alpha is currently at 98% capacity. I recommend dispatching traffic through the North Corridor and opening Gate 4 to alleviate the bottleneck. Evacuation protocol stands ready.";
  } else if (lowercaseMsg.includes("predict") || lowercaseMsg.includes("congestion")) {
    response = "Running predictive models for T+15m... Forecast shows severe congestion building at the main intersection due to the current influx rate. Recommending immediate deployment of traffic control units.";
  } else if (lowercaseMsg.includes("status") || lowercaseMsg.includes("health")) {
    response = `System Health is Optimal. Tracking ${devices.length} active devices globally. Kafka and Redis pipelines are nominal with 14ms average latency.`;
  }

  // Simulate LLM processing delay
  setTimeout(() => {
    res.json({ response });
  }, 1200);
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 8080;
const NUM_DEVICES = 5000;
let currentCenter = { lat: 28.6139, lng: 77.2090 }; // Default to New Delhi initially

// Generate initial devices
let devices = [];
function scatterDevices(center) {
  devices = [];
  for (let i = 0; i < NUM_DEVICES; i++) {
    devices.push({
      deviceId: `device-${i}`,
      latitude: center.lat + (Math.random() - 0.5) * 0.1,
      longitude: center.lng + (Math.random() - 0.5) * 0.1,
      speed: Math.random() * 60, // 0 to 60 mph
      batteryLevel: 100
    });
  }
}

scatterDevices(currentCenter);

// Set up /stream namespace
const streamNamespace = io.of('/stream');

streamNamespace.on('connection', (socket) => {
  console.log(`[+] Client connected to stream: ${socket.id}`);
  
  socket.on('set_location', (data) => {
    console.log(`[!] Relocating telemetry to: ${data.lat}, ${data.lng}`);
    if (data.lat && data.lng) {
      currentCenter = { lat: parseFloat(data.lat), lng: parseFloat(data.lng) };
      scatterDevices(currentCenter);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[-] Client disconnected: ${socket.id}`);
  });
});

// Simulation loop
setInterval(() => {
  // Move devices randomly
  for (let device of devices) {
    // Random walk
    device.latitude += (Math.random() - 0.5) * 0.0005;
    device.longitude += (Math.random() - 0.5) * 0.0005;
    // Vary speed
    device.speed = Math.max(0, Math.min(80, device.speed + (Math.random() - 0.5) * 10));
    device.batteryLevel = Math.max(0, device.batteryLevel - 0.01);
  }

  // Broadcast to all connected clients on /stream
  streamNamespace.emit('telemetry_batch', devices);
}, 1000); // 1Hz update rate

server.listen(PORT, () => {
  console.log(`🚀 CrowdFlow Mock Telemetry Server running on port ${PORT}`);
  console.log(`📡 Simulating ${NUM_DEVICES} active edge devices...`);
});
