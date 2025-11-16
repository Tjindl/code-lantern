import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { toCompoundElements } from './utils/compoundNodesAdapter';

/**
 * CompoundGraph
 * Renders function-network graph using Cytoscape compound nodes
 * - Files are parent nodes
 * - Functions are children
 */


export default function CompoundGraph({ repoId, apiBase = 'http://localhost:8000' }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [error, setError] = useState(null);

  const stylesheet = [
    { selector: 'node[type="file"]', style: { 'background-color': '#f3f4f6', 'border-width': 1, 'border-color': '#9ca3af', 'label': 'data(label)', 'font-weight': 'bold' } },
    { selector: 'node[type="function"]', style: { 'label': 'data(label)', 'text-valign': 'center', 'text-halign': 'center', 'background-color': '#60a5fa', 'color': '#fff', 'font-size': '10px' } },
    { selector: '$node > node', style: { 'padding': '12px', 'text-valign': 'top', 'text-halign': 'center' } },
    { selector: 'edge', style: { 'width': 2, 'line-color': '#9ca3af', 'target-arrow-color': '#9ca3af', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier' } }
  ];

  async function fetchFunctionNetwork() {
    const res = await fetch(`${apiBase}/api/graph-data/${repoId}?graph_type=function-network`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data;
  }

  useEffect(() => {
    if (!repoId) return;
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchFunctionNetwork();
        if (cancelled) return;
        const elements = toCompoundElements(data);
        if (cyRef.current) { try { cyRef.current.destroy(); } catch {} cyRef.current = null; }
        const cy = cytoscape({ container: containerRef.current, elements, style: stylesheet, layout: { name: 'cose-bilkent', nodeRepulsion: 4500 } });
        cyRef.current = cy;
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    }
    load();

    return () => { cancelled = true; try { cyRef.current?.destroy(); } catch {}; cyRef.current = null; };
  }, [repoId, apiBase]);

  return (
    <div>
      {error && <div style={{ color: '#b91c1c', fontSize: 12, marginBottom: 8 }}>Error: {error}</div>}
      <div ref={containerRef} style={{ width: '100%', height: 480, border: '1px solid #e5e7eb', borderRadius: 8 }} />
    </div>
  );
}
