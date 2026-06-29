import React, { useMemo } from 'react';
import Map from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react/typed';
import { ScatterplotLayer } from '@deck.gl/layers/typed';
import { useTelemetryStore, useTelemetryStream } from '../hooks/useTelemetryStream';

// Initial viewport
const INITIAL_VIEW_STATE = {
  longitude: -74.0060, // New York
  latitude: 40.7128,
  zoom: 11,
  pitch: 45,
  bearing: 0
};

const MapLayer: React.FC = () => {
  // Initialize WebSocket stream
  useTelemetryStream();

  // Retrieve raw points array from Zustand
  const points = useTelemetryStore(state => state.getPoints());

  // Construct Deck.gl Layers
  const layers = useMemo(() => [
    new ScatterplotLayer({
      id: 'device-scatter-layer',
      data: points,
      pickable: true,
      opacity: 0.8,
      stroked: false,
      filled: true,
      radiusScale: 6,
      radiusMinPixels: 2,
      radiusMaxPixels: 100,
      lineWidthMinPixels: 1,
      getPosition: d => [d.longitude, d.latitude],
      getFillColor: d => [
        // Color transition based on speed
        d.speed > 50 ? 255 : 0, 
        d.speed < 20 ? 255 : 0, 
        100
      ],
      getLineColor: d => [0, 0, 0]
    })
  ], [points]);

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
      style={{ width: '100%', height: '100%' }}
    >
      <Map
        mapLib={maplibregl}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        preventStyleDiffing={true}
      />
    </DeckGL>
  );
};

export default MapLayer;
