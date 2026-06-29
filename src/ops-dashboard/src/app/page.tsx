export default function Home() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-crowd_panel p-6 rounded-lg border border-gray-800">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Active Edge Devices</h3>
        <p className="text-4xl font-bold text-white">42,891</p>
        <div className="mt-4 text-xs text-crowd_green">+1,204 this hour</div>
      </div>
      
      <div className="bg-crowd_panel p-6 rounded-lg border border-gray-800">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Ingestion Rate</h3>
        <p className="text-4xl font-bold text-white">12.4k</p>
        <div className="mt-4 text-xs text-gray-500">events per second</div>
      </div>

      <div className="bg-crowd_panel p-6 rounded-lg border border-gray-800">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Cluster Load</h3>
        <p className="text-4xl font-bold text-white">68%</p>
        <div className="mt-4 text-xs text-yellow-500">Auto-scaling standing by</div>
      </div>

      {/* Placeholder for larger charts/tables */}
      <div className="md:col-span-3 bg-crowd_panel p-6 rounded-lg border border-gray-800 min-h-[400px] flex items-center justify-center">
        <p className="text-gray-500 italic">Advanced Analytics Visualization Rendering...</p>
      </div>
    </div>
  )
}
