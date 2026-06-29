import React, { useMemo, useState } from 'react';
import Map from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react/typed';
import { GeoJsonLayer, PathLayer } from '@deck.gl/layers/typed';
import { HexagonLayer, HeatmapLayer } from '@deck.gl/aggregation-layers/typed';
import { useTelemetryStore, useTelemetryStream } from '../hooks/useTelemetryStream';

// Initial viewport
const INITIAL_VIEW_STATE = {
  longitude: 77.2090, // New Delhi, India
  latitude: 28.6139,
  zoom: 11,
  pitch: 45,
  bearing: 0
};

// Mock administrative zones
const MOCK_ZONES = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Zone Alpha', status: 'critical' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[77.10, 28.70], [77.30, 28.70], [77.30, 28.50], [77.10, 28.50], [77.10, 28.70]]]
      }
    }
  ]
};

const MapLayer: React.FC = () => {
  // Initialize WebSocket stream
  useTelemetryStream();

  // Retrieve raw points array from Zustand
  const points = useTelemetryStore(state => state.getPoints());
  
  // Route Recommendation State
  const [destination, setDestination] = useState<[number, number] | null>(null);

  // Construct Deck.gl Layers
  const layers = useMemo(() => {
    const baseLayers = [
      new GeoJsonLayer({
        id: 'zones-layer',
        data: MOCK_ZONES,
        pickable: true,
        stroked: true,
        filled: true,
        extruded: false,
        getFillColor: f => f.properties.status === 'critical' ? [220, 38, 38, 50] : [74, 222, 128, 50],
        getLineColor: [255, 255, 255, 100],
        lineWidthMinPixels: 2
      }),
      new HeatmapLayer({
        id: 'heatmapLayer',
        data: points,
        getPosition: d => [d.longitude, d.latitude],
        getWeight: d => d.speed,
        radiusPixels: 40,
        intensity: 1,
        threshold: 0.1,
      }),
      new HexagonLayer({
        id: 'hexagonLayer',
        data: points,
        pickable: true,
        extruded: true,
        radius: 200,
        elevationScale: 10,
        getPosition: d => [d.longitude, d.latitude],
        colorRange: [
          [74, 222, 128],  // green
          [250, 204, 21],  // yellow
          [251, 146, 60],  // orange
          [248, 113, 113], // red
          [220, 38, 38]    // dark red
        ]
      })
    ];

    if (destination) {
      baseLayers.push(
        new PathLayer({
          id: 'route-layer',
          data: [{
            path: [[INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude], destination],
            color: [74, 222, 128] // Green route
          }],
          pickable: true,
          widthScale: 20,
          widthMinPixels: 4,
          getPath: d => d.path,
          getColor: d => d.color,
          getWidth: d => 5
        })
      );
    }

    return baseLayers;
  }, [points, destination]);

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
      style={{ width: '100%', height: '100%' }}
      onClick={(info) => {
        if (info.coordinate) {
          setDestination([info.coordinate[0], info.coordinate[1]]);
          // Simulate popup trigger for ETA
          alert(`Optimal Route Calculated.\nETA: 12 mins\nDistance: 4.2 km`);
        }
      }}
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
