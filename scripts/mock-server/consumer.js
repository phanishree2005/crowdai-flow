const { Kafka } = require('kafkajs');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 8080;

const kafka = new Kafka({
  clientId: 'telemetry-consumer',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'telemetry-group' });

// Set up /stream namespace for frontend
const streamNamespace = io.of('/stream');

streamNamespace.on('connection', (socket) => {
  console.log(`[+] Web Client connected to stream: ${socket.id}`);
  
  socket.on('set_location', (data) => {
    console.log(`[!] User searched location, requested backend re-center: ${data.lat}, ${data.lng}`);
    // Ideally this would publish a control message to Kafka for the producer to read,
    // but for simplicity in Phase 3, we just acknowledge it.
  });

  socket.on('disconnect', () => {
    console.log(`[-] Web Client disconnected: ${socket.id}`);
  });
});

async function run() {
  await consumer.connect();
  console.log('🚀 Kafka Consumer connected successfully');
  
  await consumer.subscribe({ topic: 'telemetry-stream', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const batch = JSON.parse(message.value.toString());
        // Push straight from Kafka to UI WebSockets
        streamNamespace.emit('telemetry_batch', batch);
      } catch (err) {
        console.error("Error parsing Kafka message", err);
      }
    },
  });
}

server.listen(PORT, () => {
  console.log(`🚀 CrowdFlow Backend Edge Router running on port ${PORT}`);
  run().catch(console.error);
});
