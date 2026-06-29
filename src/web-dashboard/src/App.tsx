import React from 'react';
import MapLayer from './components/MapLayer';

const App: React.FC = () => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Absolute positioned overlay for HUD */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(20, 20, 20, 0.85)',
        padding: '20px',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        border: '1px solid #333',
        minWidth: '300px'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#4ade80' }}>
          CrowdFlow AI Core
        </h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#a3a3a3' }}>
          Real-time Geospatial Telemetry
        </p>
      </div>

      {/* The WebGL Map Visualization */}
      <MapLayer />
    </div>
  );
};

export default App;
