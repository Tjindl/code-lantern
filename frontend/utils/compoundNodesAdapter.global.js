// utils/compoundNodesAdapter.global.js
// Global helper to build Cytoscape compound elements: files as parents, functions as children.
// This mirrors utils/compoundNodesAdapter.js but attaches to window for browser demos.
(function(){
  function toCompoundElements(graphData){
    const elements = [];
    const filesMap = new Map();
    const nodes = (graphData && graphData.nodes) || [];
    const edges = (graphData && graphData.edges) || [];

    nodes.forEach(n => {
      const data = n.data || {};
      const file = data.file || 'unknown';
      const fileId = `file:${file}`;
      if (!filesMap.has(fileId)){
        filesMap.set(fileId, {
          data: { id: fileId, label: file.split('/').pop(), full_path: file, type: 'file' },
          style: { 'shape': 'round-rectangle' }
        });
      }
      // keep original node data and style; set parent = fileId
      elements.push(Object.assign({}, n, { data: Object.assign({}, data, { parent: fileId }) }));
    });

    filesMap.forEach(fn => elements.push(fn));
    edges.forEach(e => elements.push(e));
    return elements;
  }
  window.toCompoundElements = toCompoundElements;
})();