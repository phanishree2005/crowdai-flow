import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { create } from 'zustand';

// Define the shape of incoming device telemetry
export interface DeviceTelemetry {
  deviceId: string;
  latitude: number;
  longitude: number;
  speed: number;
  batteryLevel: number;
}

// Global socket instance
export const telemetrySocket = io('http://localhost:8080/stream', {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000
});

// Zustand store to hold high-frequency streaming telemetry points
interface TelemetryStore {
  devices: DeviceTelemetry[];
  deviceCount: number;
  updateBatch: (batch: DeviceTelemetry[]) => void;
  getPoints: () => DeviceTelemetry[];
}

export const useTelemetryStore = create<TelemetryStore>((set, get) => ({
  devices: [],
  deviceCount: 5000, // Sensible live enterprise default while connecting
  updateBatch: (batch) => set({
    devices: batch,
    deviceCount: batch.length
  }),
  getPoints: () => get().devices
}));

export const useTelemetryStream = () => {
  const updateBatch = useTelemetryStore(state => state.updateBatch);

  useEffect(() => {
    if (!telemetrySocket.connected) {
      telemetrySocket.connect();
    }

    const onConnect = () => {
      console.log('Connected to CrowdFlow Telemetry Stream');
    };

    const onBatch = (batch: DeviceTelemetry[]) => {
      updateBatch(batch);
    };

    telemetrySocket.on('connect', onConnect);
    telemetrySocket.on('telemetry_batch', onBatch);

    return () => {
      telemetrySocket.off('connect', onConnect);
      telemetrySocket.off('telemetry_batch', onBatch);
    };
  }, [updateBatch]);
};
