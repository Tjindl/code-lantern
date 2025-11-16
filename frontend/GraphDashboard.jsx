import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';

/**
 * GraphDashboard
 * Renders four Cytoscape.js graphs using backend graph data
 *
 * Props:
 * - repoId: string (required)
 * - apiBase: string (default: http://localhost:8000)
 */
export default function GraphDashboard({ repoId, apiBase = 'http://localhost:8000' }) {
  const funcRef = useRef(null);
  const fileRef = useRef(null);
  const bubbleRef = useRef(null);
  const hierRef = useRef(null);

  const cyFuncRef = useRef(null);
  const cyFileRef = useRef(null);
  const cyBubbleRef = useRef(null);
  const cyHierRef = useRef(null);

  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const baseStylesheet = [
    { selector: 'node', style: { label: 'data(label)', 'text-valign': 'center', 'text-halign': 'center', color: '#111', 'font-size': '10px' } },
    { selector: 'edge', style: { width: 2, 'line-color': '#bbb', 'target-arrow-color': '#bbb', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier' } }
  ];

  async function fetchGraphData(graphType) {
    const url = `${apiBase}/api/graph-data/${repoId}?graph_type=${encodeURIComponent(graphType)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${graphType}: HTTP ${res.status}`);
    return res.json();
  }

  function mountCy(container, elements, layout, instanceRef) {
    if (!container) return null;
    // Destroy previous instance to avoid leaks
    if (instanceRef.current) {
      try { instanceRef.current.destroy(); } catch {}
      instanceRef.current = null;
    }
    const cy = cytoscape({
      container,
      elements,
      layout,
      style: baseStylesheet
    });
    instanceRef.current = cy;
    return cy;
  }

  useEffect(() => {
    if (!repoId) return;
    let cancelled = false;

    async function loadAll() {
      try {
        setStatus('loading');
        setError(null);

        // Parallel fetches
        const [func, file, bubble, hier] = await Promise.all([
          fetchGraphData('function-network'),
          fetchGraphData('file-dependency'),
          fetchGraphData('complexity-bubble'),
          fetchGraphData('call-hierarchy')
        ]);
        if (cancelled) return;

        const fnElems = [...(func.data.nodes || []), ...(func.data.edges || [])];
        const fileElems = [...(file.data.nodes || []), ...(file.data.edges || [])];
        const bubbleElems = [...(bubble.data.nodes || []), ...(bubble.data.edges || [])];
        const hierElems = [...(hier.data.nodes || []), ...(hier.data.edges || [])];

        mountCy(funcRef.current, fnElems, { name: 'cose' }, cyFuncRef);
        mountCy(fileRef.current, fileElems, { name: 'breadthfirst', directed: true, spacingFactor: 1.2 }, cyFileRef);
        mountCy(bubbleRef.current, bubbleElems, { name: 'preset' }, cyBubbleRef);
        mountCy(hierRef.current, hierElems, { name: 'breadthfirst', directed: true, roots: 'node[is_root]', spacingFactor: 1.3 }, cyHierRef);

        setStatus('ready');
      } catch (e) {
        if (!cancelled) {
          setError(e.message || String(e));
          setStatus('error');
        }
      }
    }

    loadAll();

    return () => {
      cancelled = true;
      // Cleanup cy instances
      [cyFuncRef, cyFileRef, cyBubbleRef, cyHierRef].forEach(ref => {
        try { ref.current?.destroy(); } catch {}
        ref.current = null;
      });
    };
  }, [repoId, apiBase]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Architecture Graphs</h2>
        <div style={{ fontSize: 12, color: '#666' }}>
          Status: {status}{error ? ` • ${error}` : ''}
        </div>
      </header>

      <section>
        <h3>Function Network</h3>
        <div ref={funcRef} style={{ width: '100%', height: 380, border: '1px solid #ddd', borderRadius: 8 }} />
      </section>

      <section>
        <h3>File Dependencies</h3>
        <div ref={fileRef} style={{ width: '100%', height: 380, border: '1px solid #ddd', borderRadius: 8 }} />
      </section>

      <section>
        <h3>Complexity Bubbles</h3>
        <div ref={bubbleRef} style={{ width: '100%', height: 380, border: '1px solid #ddd', borderRadius: 8 }} />
      </section>

      <section>
        <h3>Call Hierarchy</h3>
        <div ref={hierRef} style={{ width: '100%', height: 380, border: '1px solid #ddd', borderRadius: 8 }} />
      </section>
    </div>
  );
}
