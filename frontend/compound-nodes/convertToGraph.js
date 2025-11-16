// convertToGraph.js
export default function buildCytoscapeElements(structure) {
  const nodes = [];
  const edges = [];
  let edgeCounter = 0;

  const fileColorMap = {};

  function randomHue() {
    return Math.floor(Math.random() * 360); // 0–359
  }

  function makeFileColor(h) {
    const s = 25;  // low saturation for very soft color
    const l = 92;  // very light
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  function makeFuncColor(h) {
    const s = 40;  // bit more saturated
    const l = 78;  // a bit darker than file
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  structure.listOfFiles.forEach(file => {
    const fileId = file.filePath;
    const fileLabel = fileId.split('/').pop(); // e.g. "src/fileA.js" -> "fileA.js"

    // assign hue (and thus colors) per file once
    if (!fileColorMap[fileId]) {
      const h = randomHue();
      fileColorMap[fileId] = {
        fileColor: makeFileColor(h),
        funcColor: makeFuncColor(h)
      };
    }

    const { fileColor, funcColor } = fileColorMap[fileId];

    // Parent node = file
    nodes.push({
      data: {
        id: fileId,          // internal ID for graph
        label: fileLabel,    // short display label
        fileColor,           // bg color for the file node
        funcColor            // stored here too for convenience (if needed)
      }
    });

    // Child nodes = functions
    file.listOfFunctions.forEach(fn => {
      const fnId = fn.functionName;
      const fnLabel = fnId.split('-').pop(); // "src/..-funcA1" -> "funcA1"

      nodes.push({
        data: {
          id: fnId,
          label: fnLabel,
          parent: fileId,
          funcColor   // bg color for function nodes inside this file
        }
      });

      // Edges = Calls from this function
      (fn.Calls || []).forEach(targetId => {
        edges.push({
          data: {
            id: `e${edgeCounter++}`,
            source: fnId,
            target: targetId
          }
        });
      });
    });
  });

  return { nodes, edges };
}
