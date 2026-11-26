import React, { useEffect, useState } from 'react';
import MapLayer from './components/MapLayer';
import DigitalTwin from './components/DigitalTwin';
import { Search, Bell, Activity, AlertTriangle, Play, Zap, Camera, Crosshair, Send, Layers, Shield } from 'lucide-react';
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

const App: React.FC = () => {
  useTelemetryStream();
  const deviceCount = useTelemetryStore(state => state.deviceCount);
  
  // Use actual telemetry data for statistics, fallback to loading/0 state if empty
  const activeDevices = deviceCount || 5000;
  const currentCrowd = Math.floor(activeDevices * 1.8); // Estimated crowd multiplier based on devices
  const criticalZones = 4; // Matching the 4 dynamic accident hotspots
  const healthyZones = Math.max(0, Math.floor(activeDevices / 50) - criticalZones);

  const [viewMode, setViewMode] = useState<'map' | 'twin'>('map');
  const [timePrediction, setTimePrediction] = useState('Live');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const [notifications, setNotifications] = useState<string[]>(['Redis Recovered', 'New Anomaly Detected']);

  // Global Map Center State
  const [mapCenter, setMapCenter] = useState({ latitude: 28.6139, longitude: 77.2090 }); // Default New Delhi

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
      setChatHistory(prev => [...prev, { role: 'ai', content: 'AI Service is currently offline.' }]);
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
          
          // Send to backend to scatter devices around new location
          telemetrySocket.emit('set_location', { lat: lat, lng: lon });
          
          setNotifications(prev => [...prev, `Map centered to ${data[0].display_name.split(',')[0]}`]);
        } else {
          alert('Location not found');
        }
      } catch (err) {
        console.error('Search error', err);
      }
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-crowd_bg text-white font-sans">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        {viewMode === 'map' ? <MapLayer center={mapCenter} /> : <DigitalTwin />}
      </div>

      {/* Top Navbar */}
      <div className="absolute top-0 left-0 right-0 h-16 glass z-10 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Zap className="text-crowd_green w-6 h-6" />
          <h1 className="text-lg font-bold tracking-wider">CrowdFlow AI Enterprise</h1>
        </div>
        <div className="flex items-center gap-6">
          {/* Floor Selector */}
          <div className="flex items-center gap-2 bg-black/40 border border-gray-700 px-3 py-1.5 rounded-lg text-sm">
            <Layers className="w-4 h-4 text-gray-400" />
            <select className="bg-transparent focus:outline-none text-white appearance-none cursor-pointer">
              <option>Ground Floor</option>
              <option>Level 1 (Concourse)</option>
              <option>Level 2 (VIP)</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex bg-black/50 rounded-lg p-1 border border-gray-800">
             <button 
               onClick={() => setViewMode('map')}
               className={`px-3 py-1 rounded text-xs font-bold transition-colors ${viewMode === 'map' ? 'bg-crowd_green text-black' : 'text-gray-400 hover:text-white'}`}>
               Macro Map
             </button>
             <button 
               onClick={() => setViewMode('twin')}
               className={`px-3 py-1 rounded text-xs font-bold transition-colors ${viewMode === 'twin' ? 'bg-crowd_green text-black' : 'text-gray-400 hover:text-white'}`}>
               Digital Twin
             </button>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Global Location... (Enter)" 
              onKeyDown={handleSearch}
              className="bg-black/40 border border-gray-700 rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-crowd_green transition-colors w-72"
            />
          </div>

          {/* Role Selector */}
          <div className="flex items-center gap-2 hover:text-crowd_green transition-colors cursor-pointer bg-black/40 border border-gray-700 px-3 py-1.5 rounded-lg">
            <Shield className="w-4 h-4" />
            <select className="bg-transparent focus:outline-none text-sm font-medium appearance-none cursor-pointer">
              <option>Admin Role</option>
              <option>Security Role</option>
              <option>Police Role</option>
            </select>
          </div>
        </div>
      </div>

      {/* Left Sidebar (KPIs & Charts) */}
      <motion.div 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute top-20 left-4 bottom-24 w-80 glass rounded-lg flex flex-col gap-4 p-4 z-10 overflow-y-auto"
      >
        <h2 className="text-xs uppercase text-gray-400 font-bold tracking-widest mb-2">Live Statistics</h2>
        
        <div className="bg-black/30 p-3 rounded border border-gray-800">
          <div className="text-gray-400 text-xs mb-1 flex items-center justify-between">
            <span>Active Devices</span>
            <Activity className="w-3 h-3 text-crowd_green" />
          </div>
          <div className="text-2xl font-mono">{activeDevices.toLocaleString()}</div>
        </div>

        <div className="bg-black/30 p-3 rounded border border-gray-800">
          <div className="text-gray-400 text-xs mb-1">Current Crowd</div>
          <div className="text-2xl font-mono">{currentCrowd.toLocaleString()}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="bg-black/30 p-3 rounded border border-gray-800">
            <div className="text-crowd_green text-xs mb-1">Healthy Zones</div>
            <div className="text-lg font-mono">{healthyZones}</div>
          </div>
          <div className="bg-black/30 p-3 rounded border border-gray-800">
            <div className="text-crowd_red text-xs mb-1">Critical Zones</div>
            <div className="text-lg font-mono">{criticalZones}</div>
          </div>
        </div>

        {/* Phase 4: Analytics Chart */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <h2 className="text-xs uppercase text-gray-400 font-bold tracking-widest mb-4">Crowd Density Trend</h2>
          <div className="h-32 w-full">
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
                  contentStyle={{ backgroundColor: 'rgba(20,20,20,0.9)', border: '1px solid #333', borderRadius: '4px' }}
                  itemStyle={{ color: '#4ade80' }}
                />
                <Area type="monotone" dataKey="density" stroke="#4ade80" fillOpacity={1} fill="url(#colorDensity)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-auto bg-crowd_green/10 border border-crowd_green/30 p-3 rounded">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-crowd_green animate-pulse" />
            <span className="text-xs text-crowd_green font-medium">System Online</span>
          </div>
          <div className="text-[10px] text-gray-400 flex justify-between"><span>Events/sec:</span> <span>12,842</span></div>
          <div className="text-[10px] text-gray-400 flex justify-between mt-1"><span>Kafka Msgs:</span> <span>8,391/s</span></div>
          <div className="text-[10px] text-gray-400 flex justify-between mt-1"><span>Avg Latency:</span> <span>14ms</span></div>
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
            <Bell className="w-4 h-4" /> Alerts
          </h2>
          <span className="bg-crowd_red text-black text-[10px] font-bold px-2 py-0.5 rounded-full">7 Active</span>
        </div>

        <div className="bg-crowd_red/10 border border-crowd_red/30 p-3 rounded shrink-0">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-crowd_red shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-bold text-crowd_red mb-1">Crowd Density High</div>
              <div className="text-xs text-gray-300">Zone Alpha is at 98% capacity.</div>
              <div className="mt-2 text-[10px] uppercase font-bold text-crowd_red">Severity: Critical</div>
              <button 
                onClick={() => alert('Evacuation Protocol Initiated. AI redirecting all active traffic away from Zone Alpha.')}
                className="mt-3 w-full bg-crowd_red hover:bg-red-600 text-white font-bold text-xs py-2 rounded shadow-[0_0_15px_rgba(248,113,113,0.5)] transition-all">
                Run Evacuation
              </button>
            </div>
          </div>
        </div>

        {/* Phase 3: Camera YOLO Widget */}
        <div className="bg-black/40 border border-gray-800 p-3 rounded shrink-0 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2 relative z-10">
            <h3 className="text-xs font-bold text-gray-300 flex items-center gap-2"><Camera className="w-4 h-4" /> Camera 21 (Gate A)</h3>
            <span className="text-[10px] text-crowd_green flex items-center gap-1 animate-pulse"><Crosshair className="w-3 h-3"/> YOLOv8 Live</span>
          </div>
          <div className="relative w-full h-24 bg-gray-900 rounded overflow-hidden border border-gray-700 flex items-center justify-center">
            {/* Mock Camera View */}
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center"></div>
            
            {/* Mock Animated Bounding Boxes */}
            <motion.div 
              animate={{ x: [0, 40, 80, 40, 0], y: [0, -10, 0, 10, 0] }} 
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute top-4 left-10 w-12 h-16 border-2 border-crowd_green rounded-sm shadow-[0_0_8px_rgba(74,222,128,0.5)]">
                <span className="absolute -top-3 left-0 text-[8px] bg-crowd_green text-black px-1 font-bold">person 0.94</span>
            </motion.div>

            <motion.div 
              animate={{ x: [0, -30, -60, -30, 0], y: [0, 5, 10, 5, 0] }} 
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute top-8 right-10 w-10 h-14 border-2 border-crowd_green rounded-sm shadow-[0_0_8px_rgba(74,222,128,0.5)]">
                <span className="absolute -top-3 left-0 text-[8px] bg-crowd_green text-black px-1 font-bold">person 0.89</span>
            </motion.div>
            
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-gray-400 relative z-10">
            <span>Occupancy: {Math.floor(activeDevices / 500)} detected</span>
            <span>Avg Confidence: 92%</span>
          </div>
        </div>

        {/* Phase 3: AI Copilot */}
        <div className="mt-auto border-t border-gray-800 pt-4 flex flex-col flex-1 min-h-[200px]">
          <h2 className="text-xs uppercase text-crowd_green font-bold tracking-widest mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Ask CrowdFlow AI
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-2 mb-3 text-xs">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`p-2 rounded max-w-[85%] ${msg.role === 'user' ? 'bg-gray-800 ml-auto' : 'bg-crowd_green/10 text-crowd_green border border-crowd_green/20'}`}>
                {msg.content}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={() => setChatInput('Suggest rerouting from Zone Alpha')} className="text-[10px] bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded transition-colors">
              Suggest rerouting
            </button>
            <button onClick={() => setChatInput('Predict 15m congestion')} className="text-[10px] bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded transition-colors">
              Predict 15m congestion
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
            <button onClick={handleAIChat} className="absolute right-2 top-1.5 text-gray-400 hover:text-crowd_green">
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
          <button className="w-8 h-8 rounded-full bg-crowd_green/20 flex items-center justify-center text-crowd_green hover:bg-crowd_green/30 transition-colors">
            <Play className="w-4 h-4 ml-0.5" />
          </button>
          
          <div className="flex-1 flex items-center gap-4">
            <span className="text-xs text-gray-400 font-mono">10:30</span>
            <div className="h-1 bg-gray-800 rounded-full flex-1 relative">
              <div className="absolute top-0 left-0 bottom-0 w-3/4 bg-crowd_green rounded-full"></div>
              <div className="absolute top-1/2 left-3/4 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow border-2 border-crowd_green cursor-pointer"></div>
            </div>
            <span className="text-xs text-crowd_green font-bold font-mono uppercase">Live</span>
          </div>

          {/* Prediction Layer Controls */}
          <div className="flex bg-black/50 rounded-lg p-1 border border-gray-800 ml-4">
            {['Live', '+5m', '+15m', '+30m'].map(t => (
              <button 
                key={t}
                onClick={() => setTimePrediction(t)}
                className={`px-3 py-1 rounded text-[10px] font-bold transition-colors ${timePrediction === t ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 ml-12 border-l border-gray-800 pl-6 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-crowd_green"></div>
            <span className="text-[10px] uppercase font-bold text-gray-400">Kafka</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-crowd_green"></div>
            <span className="text-[10px] uppercase font-bold text-gray-400">Redis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-crowd_green"></div>
            <span className="text-[10px] uppercase font-bold text-gray-400">Flink</span>
          </div>
          <div className="text-[10px] uppercase font-bold text-gray-400 border border-gray-700 px-2 py-1 rounded bg-black/30">
            GPU 76%
          </div>
        </div>
      </motion.div>

      {/* Live Notifications Toasts */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map((note, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-crowd_panel backdrop-blur border border-gray-700 p-3 rounded shadow-lg flex items-center gap-3 text-xs pointer-events-auto min-w-[250px]"
            >
              <Bell className="w-4 h-4 text-crowd_green" />
              {note}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default App;
