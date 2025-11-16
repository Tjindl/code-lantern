// utils/compoundNodesAdapter.js
// Convert backend graph data (function-network) into Cytoscape compound nodes
// - Each file becomes a parent node
// - Each function becomes a child node with parent = file node

export function toCompoundElements(graphData) {
  const elements = [];
  const filesMap = new Map();

  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];

  // Build file parent nodes and child function nodes
  nodes.forEach(n => {
    const data = n.data || {};
    const file = data.file || 'unknown';
    const fileId = `file:${file}`;

    if (!filesMap.has(fileId)) {
      filesMap.set(fileId, {
        data: {
          id: fileId,
          label: file.split('/').pop(),
          full_path: file,
          type: 'file'
        },
        style: {
          'shape': 'round-rectangle'
        }
      });
    }

    // Clone node and assign parent
    elements.push({
      ...n,
      data: {
        ...data,
        parent: fileId
      }
    });
  });

  // Add unique file parent nodes
  filesMap.forEach(fileNode => elements.push(fileNode));

  // Add edges as-is
  edges.forEach(e => elements.push(e));

  return elements;
}
