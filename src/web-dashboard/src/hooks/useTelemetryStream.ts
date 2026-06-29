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
  updateDevice: (device: DeviceTelemetry) => void;
  getPoints: () => DeviceTelemetry[];
}

export const useTelemetryStore = create<TelemetryStore>((set, get) => ({
  devices: {},
  updateDevice: (device) => set((state) => ({
    devices: {
      ...state.devices,
      [device.deviceId]: device
    }
  })),
  getPoints: () => Object.values(get().devices)
}));

export const useTelemetryStream = () => {
  const updateDevice = useTelemetryStore(state => state.updateDevice);

  useEffect(() => {
    // In production, this points to the Envoy API Gateway
    const socket = io('ws://localhost:8080/stream', {
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('Connected to CrowdFlow Telemetry Stream');
    });

    socket.on('telemetry_batch', (batch: DeviceTelemetry[]) => {
      // Process massive batches efficiently
      for (const device of batch) {
        updateDevice(device);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [updateDevice]);
};
