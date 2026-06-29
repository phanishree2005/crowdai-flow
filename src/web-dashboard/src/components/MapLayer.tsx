import React, { useMemo, useState, useEffect } from 'react';
import Map from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react/typed';
import { GeoJsonLayer, PathLayer } from '@deck.gl/layers/typed';
import { HexagonLayer, HeatmapLayer } from '@deck.gl/aggregation-layers/typed';
import { useTelemetryStore, useTelemetryStream } from '../hooks/useTelemetryStream';

interface MapLayerProps {
  center: { latitude: number; longitude: number };
}

const MapLayer: React.FC<MapLayerProps> = ({ center }) => {
  // Initialize WebSocket stream
  useTelemetryStream();

  // Retrieve raw points array from Zustand
  const points = useTelemetryStore(state => state.getPoints());
  
  // Route Recommendation State
  const [destination, setDestination] = useState<[number, number] | null>(null);

  // Dynamic ViewState to smoothly animate when center prop changes
  const [viewState, setViewState] = useState({
    longitude: center.longitude,
    latitude: center.latitude,
    zoom: 11,
    pitch: 45,
    bearing: 0,
    transitionDuration: 1000
  });

  // Re-center map when search occurs
  useEffect(() => {
    setViewState(prev => ({
      ...prev,
      longitude: center.longitude,
      latitude: center.latitude,
      transitionDuration: 1000
    }));
  }, [center]);

  // Construct dynamic zones relative to the center
  const dynamicZones = useMemo(() => {
    const lat = center.latitude;
    const lng = center.longitude;
    // Generate a mock critical zone box ~2km around the center
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Zone Alpha', status: 'critical' },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [lng - 0.02, lat + 0.02], 
              [lng + 0.02, lat + 0.02], 
              [lng + 0.02, lat - 0.02], 
              [lng - 0.02, lat - 0.02], 
              [lng - 0.02, lat + 0.02]
            ]]
          }
        }
      ]
    };
  }, [center]);

  // Construct Deck.gl Layers
  const layers = useMemo(() => {
    const baseLayers = [
      new GeoJsonLayer({
        id: 'zones-layer',
        data: dynamicZones as any,
        pickable: true,
        stroked: true,
        filled: true,
        extruded: false,
        getFillColor: (f: any) => f.properties.status === 'critical' ? [220, 38, 38, 50] : [74, 222, 128, 50],
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
            path: [[center.longitude, center.latitude], destination],
            color: [74, 222, 128] // Green route
          }],
          pickable: true,
          widthScale: 20,
          widthMinPixels: 4,
          getPath: (d: any) => d.path,
          getColor: (d: any) => d.color,
          getWidth: (d: any) => 5
        })
      );
    }

    return baseLayers;
  }, [points, destination, dynamicZones, center]);

  return (
    <DeckGL
      viewState={viewState}
      onViewStateChange={({ viewState: newViewState }) => setViewState(newViewState as any)}
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
