const { Kafka } = require('kafkajs');

const NUM_DEVICES = 5000;
let currentCenter = { lat: 28.6139, lng: 77.2090 };

const kafka = new Kafka({
  clientId: 'telemetry-producer',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

let devices = [];
function scatterDevices(center) {
  devices = [];
  for (let i = 0; i < NUM_DEVICES; i++) {
    devices.push({
      deviceId: `device-${i}`,
      latitude: center.lat + (Math.random() - 0.5) * 0.1,
      longitude: center.lng + (Math.random() - 0.5) * 0.1,
      speed: Math.random() * 60,
      batteryLevel: 100
    });
  }
}

async function run() {
  await producer.connect();
  console.log('🚀 Kafka Producer connected successfully');
  
  scatterDevices(currentCenter);
  
  setInterval(async () => {
    for (let device of devices) {
      device.latitude += (Math.random() - 0.5) * 0.0005;
      device.longitude += (Math.random() - 0.5) * 0.0005;
      device.speed = Math.max(0, Math.min(80, device.speed + (Math.random() - 0.5) * 10));
      device.batteryLevel = Math.max(0, device.batteryLevel - 0.01);
    }

    try {
      await producer.send({
        topic: 'telemetry-stream',
        messages: [
          { value: JSON.stringify(devices) }
        ],
      });
      console.log(`[+] Published batch of ${devices.length} devices to Kafka`);
    } catch (err) {
      console.error('Failed to publish to Kafka', err);
    }
  }, 1000);
}

run().catch(console.error);
