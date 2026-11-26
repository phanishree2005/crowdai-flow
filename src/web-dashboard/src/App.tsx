import React, { useEffect, useState } from 'react';
import MapLayer from './components/MapLayer';
import DigitalTwin from './components/DigitalTwin';
import { 
  Search, Bell, Activity, AlertTriangle, Play, Zap, Camera, Crosshair, 
  Send, Layers, Shield, Download, FileText, CheckCircle, Flame, 
  AlertOctagon, RefreshCw, Sliders, Navigation, Eye, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { telemetrySocket, useTelemetryStore, useTelemetryStream } from './hooks/useTelemetryStream';

const mockChartData = [
  { time: '10:00', density: 12000 },
  { time: '10:05', density: 13500 },
  { time: '10:10', density: 15000 },
  { time: '10:15', density: 14800 },
  { time: '10:20', density: 16200 },
  { time: '10:25', density: 18000 },
  { time: '10:30', density: 18924 },
];

const cameraFeeds = {
  gate_a: {
    id: 'gate_a',
    name: 'Camera 21 (Gate A)',
    location: 'Main Entrance Turnstiles',
    occupancy: 10,
    confidence: '92%',
    fps: '29.8',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop'
  },
  gate_b: {
    id: 'gate_b',
    name: 'Camera 04 (Gate B)',
    location: 'Central Concourse Concourse',
    occupancy: 24,
    confidence: '89%',
    fps: '30.0',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=600&auto=format&fit=crop'
  },
  turnstile: {
    id: 'turnstile',
    name: 'Camera 12 (Turnstile 3)',
    location: 'Express Security Lane',
    occupancy: 6,
    confidence: '96%',
    fps: '30.0',
    image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?q=80&w=600&auto=format&fit=crop'
  },
  north: {
    id: 'north',
    name: 'Camera 09 (North Corridor)',
    location: 'Emergency Evacuation Route',
    occupancy: 18,
    confidence: '91%',
    fps: '29.5',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop'
  }
};

const App: React.FC = () => {
  useTelemetryStream();
  const rawDeviceCount = useTelemetryStore(state => state.deviceCount);
  
  // Interactive Feature States
  const [evacuationActive, setEvacuationActive] = useState(false);
  const [timePrediction, setTimePrediction] = useState<'Live' | '+5m' | '+15m' | '+30m'>('Live');
  const [chaosDrawerOpen, setChaosDrawerOpen] = useState(false);
  const [surgeActive, setSurgeActive] = useState(false);
  const [blockedCorridor, setBlockedCorridor] = useState(false);
  const [activeCamera, setActiveCamera] = useState<'gate_a' | 'gate_b' | 'turnstile' | 'north'>('gate_a');
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  // Dynamic Devices & Crowd Calculations
  let baseDevices = rawDeviceCount || 5000;
  if (surgeActive) baseDevices += 2500;

  // Apply ST-GNN prediction multiplier
  let activeDevices = baseDevices;
  if (timePrediction === '+5m') activeDevices = Math.floor(baseDevices * 1.15);
  else if (timePrediction === '+15m') activeDevices = Math.floor(baseDevices * 1.45); // Predicted peak
  else if (timePrediction === '+30m') activeDevices = Math.floor(baseDevices * 0.78); // Post-evacuation dispersal

  const currentCrowd = Math.floor(activeDevices * 1.8);
  const criticalZones = evacuationActive ? 1 : 4;
  const healthyZones = Math.max(0, Math.floor(activeDevices / 50) - criticalZones);

  const [viewMode, setViewMode] = useState<'map' | 'twin'>('map');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([
    { role: 'ai', content: 'CrowdFlow AI Copilot operational. Kafka & Flink pipelines synchronized at 14ms latency. Ask for rerouting, forecasts, or evacuation analysis.' }
  ]);
  const [notifications, setNotifications] = useState<string[]>([
    'Redis Cluster Nominally Synchronized',
    'Spatial Index Re-Indexed (100k events/s)'
  ]);

  // Global Map Center State
  const [mapCenter, setMapCenter] = useState({ latitude: 28.6139, longitude: 77.2090 });

  // Update chart data dynamically over time based on active crowd
  const [chartData, setChartData] = useState(mockChartData);
  useEffect(() => {
    if (currentCrowd === 0) return;
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev.slice(1)];
        const now = new Date();
        newData.push({
          time: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`,
          density: currentCrowd + Math.floor(Math.random() * 200 - 100)
        });
        return newData;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [currentCrowd]);

  // Toggle Evacuation Protocol
  const handleToggleEvacuation = () => {
    if (!evacuationActive) {
      setEvacuationActive(true);
      setNotifications(prev => ['🚨 EMERGENCY EVACUATION PROTOCOL ENGAGED: Escape routes live.', ...prev.slice(0, 3)]);
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: 'Execute Emergency Evacuation Protocol' },
        { 
          role: 'ai', 
          content: '🚨 EVACUATION ENGAGED: Multi-agent routing active. Traffic dispersed from Zone Alpha through Gate 4 North and Gate 2 East. Emergency portals illuminated. Turnstile delay set to 0s.' 
        }
      ]);
    } else {
      setEvacuationActive(false);
      setNotifications(prev => ['✅ Evacuation protocol disengaged. Restoring normal flow.', ...prev.slice(0, 3)]);
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: 'Reset Evacuation' },
        { role: 'ai', content: 'Standard foot-traffic monitoring restored. Zone Alpha capacity tracking re-established.' }
      ]);
    }
  };

  // Chaos Engineering Actions
  const handleToggleSurge = () => {
    setSurgeActive(prev => !prev);
    if (!surgeActive) {
      setNotifications(p => ['🚨 CHAOS TEST: Injected +2,500 edge devices at Gate 1.', ...p.slice(0, 3)]);
    } else {
      setNotifications(p => ['🔄 Injected surge removed. Telemetry normalized.', ...p.slice(0, 3)]);
    }
  };

  const handleToggleCorridorBlock = () => {
    setBlockedCorridor(prev => !prev);
    if (!blockedCorridor) {
      setNotifications(p => ['🚧 HAZARD INJECTED: North Corridor blocked. Rerouting traffic.', ...p.slice(0, 3)]);
    } else {
      setNotifications(p => ['✅ North Corridor barrier cleared.', ...p.slice(0, 3)]);
    }
  };

  const handleTriggerAlarm = () => {
    setNotifications(p => ['🔥 SMOKE ALARM TRIGGERED at Zone Alpha! Auto-initiating evacuation.', ...p.slice(0, 3)]);
    setEvacuationActive(true);
    setChatHistory(p => [
      ...p,
      { role: 'user', content: 'Zone Alpha Smoke Alarm' },
      { role: 'ai', content: '🔥 PRIORITY 1 ALARM DETECTED: Smoke sensors tripped at Zone Alpha. Automatic dispatching of facility suppression and immediate evacuation of 5,000 occupants in progress.' }
    ]);
  };

  const handleResetChaos = () => {
    setSurgeActive(false);
    setBlockedCorridor(false);
    setEvacuationActive(false);
    setTimePrediction('Live');
    setNotifications(p => ['🔄 Simulation reset to clean baseline nominal state.', ...p.slice(0, 3)]);
  };

  const handleAIChat = async () => {
    if (!chatInput.trim()) return;
    const userMessage = chatInput;
    setChatHistory([...chatHistory, { role: 'user', content: userMessage }]);
    setChatInput('');
    
    try {
      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'ai', content: data.response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', content: 'AI Service analyzing telemetry stream in local offline fallback mode.' }]);
    }
  };

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = (e.target as HTMLInputElement).value;
      if (!query.trim()) return;
      
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          
          setMapCenter({ latitude: lat, longitude: lon });
          telemetrySocket.emit('set_location', { lat: lat, lng: lon });
          setNotifications(prev => [`Map centered to ${data[0].display_name.split(',')[0]}`, ...prev.slice(0, 3)]);
        } else {
          alert('Location not found');
        }
      } catch (err) {
        console.error('Search error', err);
      }
    }
  };

  // Export Incident Audit Log
  const handleDownloadAudit = () => {
    const auditData = {
      facility: "CrowdFlow AI Enterprise - Terminal 1",
      timestamp: new Date().toISOString(),
      status: evacuationActive ? "EVACUATION_ENGAGED" : "NOMINAL",
      activeDevices: activeDevices,
      currentCrowd: currentCrowd,
      hotspots: [
        { zone: "Zone Alpha", capacity: "98%", status: "Critical" },
        { zone: "Gate 4 North", capacity: "64%", status: "Evacuation Exit" },
        { zone: "East Concourse", capacity: "42%", status: "Clear" }
      ],
      pipelineMetrics: {
        eventThroughput: "12,842 events/sec",
        kafkaLagMs: "14ms",
        flinkCheckpoints: "Passed",
        modelConfidence: "92.4% YOLOv8, 94.6% ST-GNN"
      },
      actionLog: chatHistory.map(c => `[${c.role.toUpperCase()}]: ${c.content}`)
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crowdflow_incident_audit_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-crowd_bg text-white font-sans">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        {viewMode === 'map' ? (
          <MapLayer 
            center={mapCenter} 
            evacuationActive={evacuationActive}
            timePrediction={timePrediction}
            blockedCorridor={blockedCorridor}
          />
        ) : (
          <DigitalTwin />
        )}
      </div>

      {/* Top Navbar */}
      <div className="absolute top-0 left-0 right-0 h-16 glass z-10 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Zap className="text-crowd_green w-6 h-6 animate-pulse" />
          <h1 className="text-lg font-bold tracking-wider">CrowdFlow AI Enterprise</h1>
          <span className="text-[10px] bg-crowd_green/20 text-crowd_green border border-crowd_green/40 px-2 py-0.5 rounded font-mono font-semibold">
            v2.4 LTS
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Floor Selector */}
          <div className="flex items-center gap-2 bg-black/40 border border-gray-700 px-3 py-1.5 rounded-lg text-sm">
            <Layers className="w-4 h-4 text-gray-400" />
            <select className="bg-transparent focus:outline-none text-white appearance-none cursor-pointer">
              <option>Ground Floor Concourse</option>
              <option>Level 2 Mezzanine</option>
              <option>Perimeter Transit Hub</option>
            </select>
          </div>

          {/* 2D / 3D Mode Toggle */}
          <div className="flex bg-black/40 border border-gray-700 p-0.5 rounded-lg text-xs font-semibold">
            <button 
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-md transition-colors ${viewMode === 'map' ? 'bg-crowd_green text-black font-bold' : 'text-gray-400 hover:text-white'}`}>
              Macro Map
            </button>
            <button 
              onClick={() => setViewMode('twin')}
              className={`px-3 py-1.5 rounded-md transition-colors ${viewMode === 'twin' ? 'bg-crowd_green text-black font-bold' : 'text-gray-400 hover:text-white'}`}>
              Digital Twin
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Global Location... (Enter)" 
              onKeyDown={handleSearch}
              className="bg-black/40 border border-gray-700 pl-9 pr-4 py-1.5 rounded-lg text-sm focus:outline-none focus:border-crowd_green w-64 text-white transition-colors placeholder:text-gray-500"
            />
          </div>

          {/* Chaos Sandbox Quick Trigger */}
          <button 
            onClick={() => setChaosDrawerOpen(prev => !prev)}
            className="flex items-center gap-1.5 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            <Sliders className="w-3.5 h-3.5" />
            <span>Chaos Sandbox</span>
          </button>

          {/* Export Incident Audit Button */}
          <button 
            onClick={() => setAuditModalOpen(true)}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
            <FileText className="w-3.5 h-3.5 text-crowd_green" />
            <span>Audit Report</span>
          </button>

          {/* Role Selector */}
          <div className="flex items-center gap-2 hover:text-crowd_green transition-colors cursor-pointer bg-black/40 border border-gray-700 px-3 py-1.5 rounded-lg">
            <Shield className="w-4 h-4" />
            <select className="bg-transparent focus:outline-none text-sm font-medium appearance-none cursor-pointer">
              <option>Admin Role</option>
              <option>Security Marshall</option>
              <option>Incident Commander</option>
            </select>
          </div>
        </div>
      </div>

      {/* ST-GNN Prediction Banner when active */}
      {timePrediction !== 'Live' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-blue-950/80 border border-blue-500/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
          <span className="text-xs font-mono font-bold text-blue-200">
            🔮 ST-GNN Predictive Forecasting: T{timePrediction} Simulation (Confidence: 94.6%)
          </span>
          <button 
            onClick={() => setTimePrediction('Live')}
            className="text-[10px] bg-blue-800/80 hover:bg-blue-700 px-2 py-0.5 rounded text-white font-bold ml-2">
            Reset to Live
          </button>
        </div>
      )}

      {/* Evacuation Alert Header Banner */}
      {evacuationActive && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-red-950/90 border border-red-500 backdrop-blur-md px-6 py-2 rounded-full flex items-center gap-3 shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-pulse">
          <AlertOctagon className="w-5 h-5 text-red-400" />
          <span className="text-xs font-mono font-bold text-red-200 uppercase tracking-wide">
            🚨 ACTIVE EVACUATION ENGAGED: Multi-Gate Escape Routing Enabled
          </span>
          <button 
            onClick={handleToggleEvacuation}
            className="text-[10px] bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-white font-bold ml-2 uppercase">
            Disengage
          </button>
        </div>
      )}

      {/* Left Sidebar (KPIs & Charts) */}
      <motion.div 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute top-20 left-4 bottom-24 w-80 glass rounded-lg flex flex-col gap-4 p-4 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase text-gray-400 font-bold tracking-widest">Live Statistics</h2>
          <span className="text-[10px] text-crowd_green font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-crowd_green animate-pulse" /> Live 1Hz
          </span>
        </div>
        
        <div className="bg-black/30 p-3 rounded border border-gray-800 hover:border-gray-700 transition-colors">
          <div className="text-gray-400 text-xs mb-1 flex items-center justify-between">
            <span>Active Devices</span>
            <Activity className="w-3 h-3 text-crowd_green" />
          </div>
          <div className="text-2xl font-mono text-white font-bold">{activeDevices.toLocaleString()}</div>
          <div className="text-[10px] text-gray-400 mt-1 flex justify-between">
            <span>Spatial Edge Nodes</span>
            <span className="text-crowd_green font-mono">100% Online</span>
          </div>
        </div>

        <div className="bg-black/30 p-3 rounded border border-gray-800 hover:border-gray-700 transition-colors">
          <div className="text-gray-400 text-xs mb-1 flex items-center justify-between">
            <span>Current Crowd Estimate</span>
            <span className="text-[10px] text-gray-400 font-mono">×1.8 multiplier</span>
          </div>
          <div className="text-2xl font-mono text-white font-bold">{currentCrowd.toLocaleString()}</div>
          <div className="text-[10px] text-gray-400 mt-1 flex justify-between">
            <span>Density Saturation</span>
            <span className={currentCrowd > 12000 ? 'text-crowd_red font-bold' : 'text-yellow-400'}>
              {Math.min(100, Math.floor((currentCrowd / 15000) * 100))}% Capacity
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/30 p-3 rounded border border-gray-800">
            <div className="text-crowd_green text-xs mb-1 font-semibold">Healthy Zones</div>
            <div className="text-lg font-mono font-bold">{healthyZones}</div>
            <div className="text-[9px] text-gray-400 mt-0.5">Nominal clearance</div>
          </div>
          <div className="bg-black/30 p-3 rounded border border-gray-800">
            <div className="text-crowd_red text-xs mb-1 font-semibold">Critical Zones</div>
            <div className="text-lg font-mono font-bold text-crowd_red">{criticalZones}</div>
            <div className="text-[9px] text-gray-400 mt-0.5">Active anomalies</div>
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="mt-2 pt-3 border-t border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs uppercase text-gray-400 font-bold tracking-widest">Density Trend</h2>
            <span className="text-[10px] text-gray-400 font-mono">Real-time ST-GNN</span>
          </div>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(20,20,20,0.95)', border: '1px solid #333', borderRadius: '4px', fontSize: '11px' }}
                  itemStyle={{ color: '#4ade80' }}
                />
                <Area type="monotone" dataKey="density" stroke="#4ade80" fillOpacity={1} fill="url(#colorDensity)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-auto bg-crowd_green/10 border border-crowd_green/30 p-3 rounded">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-crowd_green animate-pulse" />
              <span className="text-xs text-crowd_green font-bold">Pipeline Nominal</span>
            </div>
            <span className="text-[9px] font-mono text-gray-400">P99: 14ms</span>
          </div>
          <div className="text-[10px] text-gray-400 flex justify-between"><span>Events/sec:</span> <span className="font-mono text-white font-semibold">12,842</span></div>
          <div className="text-[10px] text-gray-400 flex justify-between mt-1"><span>Kafka Lag:</span> <span className="font-mono text-crowd_green font-semibold">0 ms</span></div>
          <div className="text-[10px] text-gray-400 flex justify-between mt-1"><span>Flink State:</span> <span className="font-mono text-white">Consistent</span></div>
        </div>
      </motion.div>

      {/* Right Sidebar (Alerts, Camera & AI) */}
      <motion.div 
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="absolute top-20 right-4 w-96 glass rounded-lg flex flex-col gap-4 p-4 z-10 bottom-24 overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-gray-800 pb-2 shrink-0">
          <h2 className="text-xs uppercase text-gray-400 font-bold tracking-widest flex items-center gap-2">
            <Bell className="w-4 h-4 text-crowd_green" /> Active Alerts
          </h2>
          <span className={`${evacuationActive ? 'bg-orange-500' : 'bg-crowd_red'} text-black text-[10px] font-bold px-2 py-0.5 rounded-full`}>
            {evacuationActive ? 'Evacuation Active' : '7 Critical'}
          </span>
        </div>

        {/* Dynamic Evacuation Action Card */}
        <div className={`${evacuationActive ? 'bg-orange-950/40 border-orange-500/50' : 'bg-crowd_red/10 border-crowd_red/30'} border p-3 rounded shrink-0 transition-colors`}>
          <div className="flex gap-3">
            <AlertTriangle className={`w-5 h-5 ${evacuationActive ? 'text-orange-400' : 'text-crowd_red'} shrink-0`} />
            <div className="flex-1">
              <div className={`text-sm font-bold ${evacuationActive ? 'text-orange-400' : 'text-crowd_red'} mb-1`}>
                {evacuationActive ? 'Evacuation Corridors Live' : 'Crowd Density Alert'}
              </div>
              <div className="text-xs text-gray-300">
                {evacuationActive 
                  ? 'All 5,000 devices guided to Gate 4 North and Gate 2 East.' 
                  : 'Zone Alpha is currently at 98% capacity.'}
              </div>
              <div className="mt-2 text-[10px] uppercase font-bold text-crowd_red flex justify-between items-center">
                <span>Severity: Critical</span>
                <span className="text-gray-400 font-mono font-normal">A* Multi-Path</span>
              </div>
              <button 
                onClick={handleToggleEvacuation}
                className={`mt-3 w-full font-bold text-xs py-2 rounded transition-all flex items-center justify-center gap-2 ${
                  evacuationActive 
                    ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.6)]' 
                    : 'bg-crowd_red hover:bg-red-600 text-white shadow-[0_0_15px_rgba(248,113,113,0.5)]'
                }`}>
                <Navigation className="w-3.5 h-3.5" />
                {evacuationActive ? 'Disengage Evacuation' : 'Run Evacuation Protocol'}
              </button>
            </div>
          </div>
        </div>

        {/* Multi-Camera YOLOv8 Stream Switcher */}
        <div className="bg-black/40 border border-gray-800 p-3 rounded shrink-0 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-crowd_green" /> 
              {cameraFeeds[activeCamera].name}
            </h3>
            <span className="text-[10px] text-crowd_green flex items-center gap-1 animate-pulse">
              <Crosshair className="w-3 h-3"/> YOLOv8
            </span>
          </div>

          {/* Camera Selection Pills */}
          <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
            {Object.values(cameraFeeds).map(cam => (
              <button
                key={cam.id}
                onClick={() => setActiveCamera(cam.id as any)}
                className={`text-[9px] px-2 py-1 rounded whitespace-nowrap font-medium transition-colors ${
                  activeCamera === cam.id 
                    ? 'bg-crowd_green text-black font-bold' 
                    : 'bg-gray-800/80 text-gray-400 hover:text-white'
                }`}>
                {cam.id.toUpperCase().replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full h-28 bg-gray-900 rounded overflow-hidden border border-gray-700 flex items-center justify-center">
            {/* Camera Visual Feed */}
            <div 
              style={{ backgroundImage: `url(${cameraFeeds[activeCamera].image})` }}
              className="absolute inset-0 opacity-40 bg-cover bg-center transition-all duration-300"
            />
            
            {/* Animated CV Bounding Boxes */}
            <motion.div 
              animate={{ x: [0, 30, 60, 30, 0], y: [0, -8, 0, 8, 0] }} 
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute top-4 left-8 w-12 h-16 border-2 border-crowd_green rounded-sm shadow-[0_0_8px_rgba(74,222,128,0.5)]">
                <span className="absolute -top-3 left-0 text-[8px] bg-crowd_green text-black px-1 font-bold">person 0.95</span>
            </motion.div>

            <motion.div 
              animate={{ x: [0, -25, -50, -25, 0], y: [0, 6, 12, 6, 0] }} 
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute top-6 right-10 w-11 h-14 border-2 border-crowd_green rounded-sm shadow-[0_0_8px_rgba(74,222,128,0.5)]">
                <span className="absolute -top-3 left-0 text-[8px] bg-crowd_green text-black px-1 font-bold">person 0.91</span>
            </motion.div>

            <div className="absolute bottom-1 right-2 bg-black/70 px-1.5 py-0.5 rounded text-[8px] font-mono text-gray-300">
              {cameraFeeds[activeCamera].fps} FPS
            </div>
          </div>

          <div className="flex justify-between mt-2 text-[10px] text-gray-400">
            <span>Occupancy: <strong className="text-white">{cameraFeeds[activeCamera].occupancy} detected</strong></span>
            <span>Confidence: <strong className="text-crowd_green">{cameraFeeds[activeCamera].confidence}</strong></span>
          </div>
        </div>

        {/* AI Copilot */}
        <div className="mt-auto border-t border-gray-800 pt-3 flex flex-col flex-1 min-h-[190px]">
          <h2 className="text-xs uppercase text-crowd_green font-bold tracking-widest mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Ask CrowdFlow AI
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-2 mb-2 text-xs max-h-36 pr-1">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`p-2 rounded max-w-[90%] leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-gray-800 text-white ml-auto border border-gray-700' 
                  : 'bg-crowd_green/10 text-crowd_green border border-crowd_green/20'
              }`}>
                {msg.content}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2">
            <button onClick={() => setChatInput('Suggest rerouting from Zone Alpha')} className="text-[9px] bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded transition-colors text-gray-300">
              Reroute Zone Alpha
            </button>
            <button onClick={() => setChatInput('Predict 15m congestion')} className="text-[9px] bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded transition-colors text-gray-300">
              Predict T+15m
            </button>
            <button onClick={() => setChatInput('System health and throughput')} className="text-[9px] bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded transition-colors text-gray-300">
              Pipeline Health
            </button>
          </div>

          <div className="relative mt-auto">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAIChat()}
              placeholder="Ask anything..." 
              className="w-full bg-black/50 border border-gray-700 rounded p-2 pr-10 text-xs text-white focus:outline-none focus:border-crowd_green transition-colors"
            />
            <button onClick={handleAIChat} className="absolute right-2 top-2 text-gray-400 hover:text-crowd_green transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bottom Bar (Timeline, Prediction Layer & Health) */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="absolute bottom-4 left-4 right-4 h-16 glass rounded-lg z-10 flex items-center justify-between px-6"
      >
        <div className="flex items-center gap-6 flex-1">
          <button 
            onClick={() => setNotifications(p => ['Playback restarted from live buffer.', ...p.slice(0, 3)])}
            className="w-8 h-8 rounded-full bg-crowd_green/20 flex items-center justify-center text-crowd_green hover:bg-crowd_green/30 transition-colors">
            <Play className="w-4 h-4 ml-0.5" />
          </button>
          
          <div className="flex-1 flex items-center gap-4">
            <span className="text-xs text-gray-400 font-mono">10:30</span>
            <div className="h-1 bg-gray-800 rounded-full flex-1 relative">
              <div 
                style={{ width: timePrediction === 'Live' ? '60%' : timePrediction === '+5m' ? '70%' : timePrediction === '+15m' ? '85%' : '100%' }}
                className="absolute top-0 left-0 bottom-0 bg-crowd_green rounded-full transition-all duration-300" 
              />
              <div 
                style={{ left: timePrediction === 'Live' ? '60%' : timePrediction === '+5m' ? '70%' : timePrediction === '+15m' ? '85%' : '100%' }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow border-2 border-crowd_green cursor-pointer transition-all duration-300" 
              />
            </div>
            <span className="text-xs text-crowd_green font-bold font-mono uppercase">{timePrediction}</span>
          </div>

          {/* Spatio-Temporal Prediction Scrubber Controls */}
          <div className="flex bg-black/60 rounded-lg p-1 border border-gray-800 ml-4">
            {(['Live', '+5m', '+15m', '+30m'] as const).map(t => (
              <button 
                key={t}
                onClick={() => {
                  setTimePrediction(t);
                  setNotifications(p => [`Switched to ST-GNN forecast: ${t}`, ...p.slice(0, 3)]);
                }}
                className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                  timePrediction === t 
                    ? 'bg-crowd_green text-black font-extrabold shadow' 
                    : 'text-gray-400 hover:text-white'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 ml-12 border-l border-gray-800 pl-6 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-crowd_green animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-gray-400">Kafka MSK</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-crowd_green animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-gray-400">Redis 7.2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-crowd_green animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-gray-400">Flink CEP</span>
          </div>
          <div className="text-[10px] uppercase font-bold text-gray-300 border border-gray-700 px-2.5 py-1 rounded bg-black/40 font-mono">
            RTX GPU 76%
          </div>
        </div>
      </motion.div>

      {/* Floating Chaos Sandbox / Demo Controls Drawer */}
      <AnimatePresence>
        {chaosDrawerOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="absolute top-20 right-4 z-50 w-80 glass border border-purple-500/40 rounded-xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-700 pb-2 mb-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <Sliders className="w-4 h-4" />
                <span>Chaos Simulation Suite</span>
              </div>
              <button 
                onClick={() => setChaosDrawerOpen(false)}
                className="text-gray-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-gray-400 mb-3">
              Inject real-time anomalies to stress-test pathfinding algorithms and Kafka/Flink pipeline telemetry:
            </p>

            <div className="space-y-2.5">
              {/* Trigger Surge */}
              <button
                onClick={handleToggleSurge}
                className={`w-full p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
                  surgeActive 
                    ? 'bg-purple-900/60 border-purple-500 text-purple-200' 
                    : 'bg-black/40 border-gray-700 hover:border-purple-500/50 text-gray-300'
                }`}>
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span>Simulate Crowd Surge (+2.5k)</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${surgeActive ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                  {surgeActive ? 'ACTIVE' : 'OFF'}
                </span>
              </button>

              {/* Block Corridor */}
              <button
                onClick={handleToggleCorridorBlock}
                className={`w-full p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
                  blockedCorridor 
                    ? 'bg-amber-900/60 border-amber-500 text-amber-200' 
                    : 'bg-black/40 border-gray-700 hover:border-amber-500/50 text-gray-300'
                }`}>
                <span className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-amber-400" />
                  <span>Block North Corridor</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${blockedCorridor ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                  {blockedCorridor ? 'BLOCKED' : 'CLEAR'}
                </span>
              </button>

              {/* Trigger Smoke Alarm */}
              <button
                onClick={handleTriggerAlarm}
                className="w-full p-2.5 rounded-lg border border-red-500/40 bg-red-950/40 hover:bg-red-900/50 text-red-300 text-xs font-semibold flex items-center justify-between transition-all">
                <span className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-400 animate-pulse" />
                  <span>Trigger Smoke/Fire Alarm</span>
                </span>
                <span className="text-[10px] bg-red-800 text-white px-1.5 py-0.5 rounded font-mono">
                  DISPATCH
                </span>
              </button>

              {/* Reset Everything */}
              <button
                onClick={handleResetChaos}
                className="w-full mt-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Simulation to Baseline</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incident Audit Report Modal */}
      <AnimatePresence>
        {auditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[85vh]"
            >
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-crowd_green" />
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Executive Incident Audit Report
                  </h3>
                </div>
                <button 
                  onClick={() => setAuditModalOpen(false)}
                  className="text-gray-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-gray-300">
                <div className="grid grid-cols-2 gap-4 bg-black/40 p-4 rounded-lg border border-gray-800 font-mono">
                  <div>
                    <span className="text-gray-500 block mb-1">INCIDENT PROTOCOL</span>
                    <span className="text-crowd_green font-bold text-sm">
                      {evacuationActive ? 'Active Emergency Evacuation' : 'Nominal Stream Monitoring'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">AUDIT TIMESTAMP</span>
                    <span className="text-white">{new Date().toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">TRACKED DEVICES</span>
                    <span className="text-white font-bold">{activeDevices.toLocaleString()} IoT nodes</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">CROWD DENSITY</span>
                    <span className="text-white font-bold">{currentCrowd.toLocaleString()} occupants</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Zone Risk Assessment</h4>
                  <div className="space-y-1.5 font-mono">
                    <div className="flex justify-between bg-black/30 p-2 rounded border border-gray-800">
                      <span className="text-gray-400">Zone Alpha (Main Hall)</span>
                      <span className="text-crowd_red font-bold">98% Capacity (CRITICAL)</span>
                    </div>
                    <div className="flex justify-between bg-black/30 p-2 rounded border border-gray-800">
                      <span className="text-gray-400">Gate 4 North Corridor</span>
                      <span className="text-crowd_green font-bold">Safe Escape Route (Active)</span>
                    </div>
                    <div className="flex justify-between bg-black/30 p-2 rounded border border-gray-800">
                      <span className="text-gray-400">East Transit Concourse</span>
                      <span className="text-crowd_green font-bold">42% Capacity (Clear)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Streaming Architecture SLA</h4>
                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="bg-black/30 p-2 rounded border border-gray-800">
                      <span className="text-[10px] text-gray-500 block">THROUGHPUT</span>
                      <span className="text-crowd_green font-bold">12,842 eps</span>
                    </div>
                    <div className="bg-black/30 p-2 rounded border border-gray-800">
                      <span className="text-[10px] text-gray-500 block">LATENCY (P99)</span>
                      <span className="text-crowd_green font-bold">14 ms</span>
                    </div>
                    <div className="bg-black/30 p-2 rounded border border-gray-800">
                      <span className="text-[10px] text-gray-500 block">FLINK CEP</span>
                      <span className="text-crowd_green font-bold">100% Nom</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                  <button 
                    onClick={() => setAuditModalOpen(false)}
                    className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-colors">
                    Close
                  </button>
                  <button 
                    onClick={handleDownloadAudit}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-crowd_green hover:bg-green-500 text-black font-bold transition-all shadow-[0_0_15px_rgba(74,222,128,0.4)]">
                    <Download className="w-4 h-4" />
                    <span>Download JSON Audit</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Notifications Toasts */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map((note, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="bg-crowd_panel backdrop-blur-md border border-gray-700/80 px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-3 text-xs pointer-events-auto min-w-[280px]"
            >
              <Bell className="w-4 h-4 text-crowd_green shrink-0" />
              <span className="text-gray-200">{note}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default App;
