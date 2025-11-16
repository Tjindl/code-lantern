import React from "react";
import CytoscapeComponent from "react-cytoscapejs";

export default function DependencyGraph({ data }) {
  if (!data) return <p>No graph data to display yet.</p>;

  return (
    <CytoscapeComponent
      elements={data.elements}
      style={{ width: "100%", height: "600px" }}
      layout={{ name: "cose" }} 
      stylesheet={[
        {
          selector: "node",
          style: {
            label: "data(label)",
            "background-color": "#4CAF50",
            color: "#fff",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "12px",
            "width": "label",
            "height": "label",
            padding: "8px",
            "border-width": 2,
            "border-color": "#2E7D32",
            shape: "round-rectangle",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
      ]}
    />
  );
}
