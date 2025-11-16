import React, { useEffect, useState } from 'react';
import FunctionCallGraph from './FunctionCallGraph';

export default function ArchitectureTab() {
  const [architectureData, setArchitectureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiBase = window.__API_BASE__ || 'http://localhost:8000';

  useEffect(() => {
    async function loadArchitecture() {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`${apiBase}/api/analyze`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        console.log('[ArchitectureTab] Architecture data:', json.architecture_map);
        setArchitectureData(json.architecture_map);
        setLoading(false);
      } catch (e) {
        setError(e.message || String(e));
        setLoading(false);
      }
    }
    loadArchitecture();
  }, [apiBase]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-400">loading architecture map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-400">error: {error}</div>
      </div>
    );
  }

  if (!architectureData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-400">no architecture data available</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col" style={{ height: '600px' }}>
      <h3 className="text-xl font-bold mb-4 text-[#00E0B8]">architecture - function call graph</h3>
      <div className="flex-1 border border-[#444] rounded-lg overflow-hidden">
        <FunctionCallGraph architectureData={architectureData} />
      </div>
    </div>
  );
}
