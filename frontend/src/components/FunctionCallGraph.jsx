// src/components/FunctionCallGraph.jsx
import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

import convertToGraph from '../services/convertToGraph';
import testStructure from '../services/testStructure.json';

const FunctionCallGraph = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Build elements from your JSON structure
    const elements = convertToGraph(testStructure);

    const cy = cytoscape({
      container: containerRef.current,

      boxSelectionEnabled: false,

      style: [
        {
          selector: 'node[parent]', // functions (children)
          css: {
            shape: 'rectangle',
            'background-color': 'data(funcColor)',
            content: 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'border-width': 1,
            'border-color': '#888',
          },
        },
        {
          // file nodes (parents) – very soft, light background
          selector: ':parent',
          css: {
            'background-color': 'data(fileColor)',
            content: 'data(label)',
            'text-valign': 'top',
            'text-halign': 'center',
            shape: 'round-rectangle',
            'corner-radius': 10,
            padding: 10,
            'border-width': 1,
            'border-color': '#aaa',
          },
        },
        {
          selector: 'node#e',
          css: {
            'corner-radius': '10',
            padding: 0,
          },
        },
        {
          selector: 'edge',
          css: {
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
          },
        },
        {
          selector: '.highlighted',
          css: {
            'background-color': '#61bffc',
            'line-color': '#61bffc',
            'target-arrow-color': '#61bffc',
            'transition-property':
              'background-color, line-color, target-arrow-color',
            'transition-duration': '0.5s',
          },
        },
      ],

      elements, // { nodes, edges }

      layout: {
        name: 'breadthfirst',
        padding: 50,
        spacingFactor: 1.5,
        avoidOverlap: true,
        avoidOverlapPadding: 20,
      },
    });

    // DFS on click, same logic as your code.js
    cy.on('tap', 'node', evt => {
      const start = evt.target;

      // Clear previous highlights
      cy.elements().removeClass('highlighted');

      // Run DFS
      const dfs = cy.elements().dfs({
        roots: start,
        directed: true,
      });

      const path = dfs.path; // nodes & edges interleaved
      console.log('DFS from', start.id(), 'length:', path.length);

      let i = 0;

      function highlightNext() {
        if (i < path.length) {
          path[i].addClass('highlighted'); // triggers the fade-in
          i++;
          setTimeout(highlightNext, 150);
        }
      }

      highlightNext();
    });

    // cleanup on unmount
    return () => {
      cy.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px', // so you can see it even in a small container
      }}
    />
  );
};

export default FunctionCallGraph;