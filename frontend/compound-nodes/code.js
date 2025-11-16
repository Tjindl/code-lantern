// code.js
import convertToGraph from './convertToGraph.js';

fetch('./testStructure.json')
  .then(res => res.json())
  .then(testStructure => {
    console.log('Loaded testStructure:', testStructure);

    const testGraph = convertToGraph(testStructure);
    console.log('Converted to Cytoscape elements:', testGraph);

    const cy = (window.cy = cytoscape({
      container: document.getElementById('cy'),

      boxSelectionEnabled: false,

      style: [
        {
          selector: 'node[parent]',     // nodes that have a parent = functions
          css: {
            'shape': 'rectangle',
            'background-color': 'data(funcColor)',
            'content': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'border-width': 1,
            'border-color': '#888'
          }
        },

        // File nodes (parents) – very soft, light background
        {
          selector: ':parent',
          css: {
            'background-color': 'data(fileColor)',
            'content': 'data(label)',
            'text-valign': 'top',
            'text-halign': 'center',
            'shape': 'round-rectangle',
            'corner-radius': 10,
            'padding': 10,
            'border-width': 1,
            'border-color': '#aaa'
          }
        },
        {
          selector: 'node#e',
          css: {
            'corner-radius': '10',
            'padding': 0
          }
        },
        {
          selector: 'edge',
          css: {
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle'
          }
        },
        {
          selector: '.highlighted',
          css: {
            'background-color': '#61bffc',
            'line-color': '#61bffc',
            'target-arrow-color': '#61bffc',
            'transition-property': 'background-color, line-color, target-arrow-color',
            'transition-duration': '0.5s'
          }
        }
      ],

      // This is what convertToGraph() returns: { nodes: [...], edges: [...] }
      elements: testGraph,

      layout: {
        // you can switch to 'cose' if you don't set positions
        name: 'breadthfirst',
        padding: 50,          // more padding around the whole graph
        spacingFactor: 1.5,   // multiply spacing between nodes
        avoidOverlap: true,   // try to avoid node overlaps
        avoidOverlapPadding: 20 // extra pixels between nodes
      }
    }));

    const root = cy.getElementById('src/controllers/orderController.js-createOrder');

    cy.on('tap', 'node', (evt) => {
      const start = evt.target;

      // Clear previous highlights from both nodes and edges
      cy.elements().removeClass('highlighted');

      // Run DFS but don't highlight in visit()
      const dfs = cy.elements().dfs({
        roots: start,
        directed: true
      });

      const path = dfs.path; // nodes & edges interleaved
      console.log('DFS from', start.id(), 'length:', path.length);

      let i = 0;

      function highlightNext() {
        if (i < path.length) {
          path[i].addClass('highlighted');  // this triggers the fade-in
          i++;
          setTimeout(highlightNext, 150);   // adjust speed here (ms)
        }
      }

      highlightNext();
    });
  })
  .catch(err => {
    console.error('Error loading testStructure.json or building graph:', err);
  });