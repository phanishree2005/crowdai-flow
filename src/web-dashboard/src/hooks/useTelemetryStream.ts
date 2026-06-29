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

// Zustand store to hold massive arrays of points without triggering
// expensive React tree re-renders for every single point update.
interface TelemetryStore {
  devices: Record<string, DeviceTelemetry>;
  updateBatch: (batch: DeviceTelemetry[]) => void;
  getPoints: () => DeviceTelemetry[];
}

export const useTelemetryStore = create<TelemetryStore>((set, get) => ({
  devices: {},
  updateBatch: (batch) => set((state) => {
    const newDevices = { ...state.devices };
    for (const device of batch) {
      newDevices[device.deviceId] = device;
    }
    return { devices: newDevices };
  }),
  getPoints: () => Object.values(get().devices)
}));

export const useTelemetryStream = () => {
  const updateBatch = useTelemetryStore(state => state.updateBatch);

  useEffect(() => {
    // In production, this points to the Envoy API Gateway
    const socket = io('ws://localhost:8080/stream', {
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('Connected to CrowdFlow Telemetry Stream');
    });

    socket.on('telemetry_batch', (batch: DeviceTelemetry[]) => {
      // Process massive batches efficiently via single state update
      updateBatch(batch);
    });

    return () => {
      socket.disconnect();
    };
  }, [updateBatch]);
};
