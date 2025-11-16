// src/components/FunctionCallGraph.jsx
import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

import convertToGraph from '../services/convertToGraph';

const FunctionCallGraph = ({ architectureData }) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  const prevDataRef = useRef(null);

  useEffect(() => {
    if (!architectureData || !containerRef.current) return;
    
    // Only rebuild if data actually changed
    if (prevDataRef.current === architectureData) {
      return;
    }
    prevDataRef.current = architectureData;
    
    // Destroy previous instance if it exists
    if (cyRef.current && !cyRef.current.destroyed()) {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
      try {
        cyRef.current.destroy();
      } catch (e) {
        console.warn('[FunctionCallGraph] Error destroying old instance:', e);
      }
      cyRef.current = null;
    }

    console.log('[FunctionCallGraph] Building graph from architecture data...');
    
    // Build elements from architecture data
    const elements = convertToGraph(architectureData);
    
    console.log('[FunctionCallGraph] Created elements:', { 
      total: elements.length,
      nodes: elements.filter(el => !el.data.source).length,
      edges: elements.filter(el => el.data.source).length
    });

    const cy = cytoscape({
      container: containerRef.current,
      boxSelectionEnabled: false,

      style: [
        {
          selector: 'node[parent]', // functions (children)
          css: {
            shape: 'ellipse',
            'background-color': '#2E7FFF',
            content: 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px',
            'font-weight': 'bold',
            color: '#FFFFFF',
            'text-outline-color': '#000000',
            'text-outline-width': 1,
            width: 70,
            height: 70,
            'border-width': 3,
            'border-color': '#00E0B8',
          },
        },
        {
          selector: ':parent', // files (parents)
          css: {
            'background-color': 'data(fileColor)',
            'background-opacity': 0.4,
            content: 'data(label)',
            'text-valign': 'top',
            'text-halign': 'center',
            'font-size': '13px',
            'font-weight': 'bold',
            color: '#00FFD1',
            'text-outline-color': '#000000',
            'text-outline-width': 1,
            shape: 'round-rectangle',
            'corner-radius': 12,
            padding: 20,
            'border-width': 3,
            'border-color': '#00E0B8',
            'border-opacity': 0.8,
          },
        },
        {
          selector: 'edge',
          css: {
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'line-color': '#AAAAAA',
            'target-arrow-color': '#AAAAAA',
            width: 2.5,
            opacity: 0.7,
          },
        },
        {
          selector: '.highlighted',
          css: {
            'background-color': '#FF4444',
            'line-color': '#FF6B35',
            'target-arrow-color': '#FF6B35',
            'border-color': '#FFD700',
            'border-width': 4,
            'transition-property':
              'background-color, line-color, target-arrow-color, border-color, border-width',
            'transition-duration': '0.3s',
          },
        },
      ],

      elements,

      layout: {
        name: 'cose',
        animate: false, // Disable animation to prevent errors on destroy
        nodeRepulsion: 10000,
        idealEdgeLength: 80,
        edgeElasticity: 100,
        gravity: 50,
        fit: true,
        padding: 40,
      },
    });

    // Store instance in ref
    cyRef.current = cy;

    // ---------- custom DFS that still visits edges to already-visited nodes ----------
    const handleNodeTap = (evt) => {
      const cyInstance = cyRef.current;
      if (!cyInstance || cyInstance.destroyed()) return;
      
      const start = evt.target;

      // Clear previous highlights and cancel ongoing animation
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
      
      try {
        cyInstance.elements().removeClass('highlighted');
      } catch (e) {
        return; // Instance was destroyed
      }

      const visitedNodes = new Set();
      const sequence = []; // ordered list of nodes/edges to highlight

      function dfs(node) {
        if (!node) return;
        const id = node.id();

        if (!visitedNodes.has(id)) {
          visitedNodes.add(id);
          sequence.push(node); // visit node first time
        }

        // Outgoing edges (respect direction)
        const outgoingEdges = node.outgoers('edge');

        outgoingEdges.forEach(edge => {
          sequence.push(edge); // always highlight the edge

          const target = edge.target();
          const targetId = target.id();

          if (!visitedNodes.has(targetId)) {
            dfs(target); // recurse into new node
          } else {
            // Node already visited: still optionally re-highlight it
            sequence.push(target);
          }
        });
      }

      dfs(start);

      console.log(
        'Custom DFS from',
        start.id(),
        'sequence length:',
        sequence.length
      );

      // Animate highlights along the computed sequence
      let i = 0;
      function highlightNext() {
        if (!cyInstance || cyInstance.destroyed() || i >= sequence.length) {
          animationTimeoutRef.current = null;
          return;
        }
        
        try {
          sequence[i].addClass('highlighted');
          i++;
          animationTimeoutRef.current = setTimeout(highlightNext, 150);
        } catch (e) {
          animationTimeoutRef.current = null;
        }
      }
      highlightNext();
    };
    
    cy.on('tap', 'node', handleNodeTap);

    // cleanup on unmount
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (cyRef.current && !cyRef.current.destroyed()) {
        cyRef.current.off('tap', 'node', handleNodeTap);
        cyRef.current.destroy();
      }
    };
  }, [architectureData]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
      }}
    />
  );
};

export default FunctionCallGraph;