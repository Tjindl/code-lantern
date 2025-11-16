import React from "react";
import UploadBox from "./components/UploadBox";

export default function App() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Code Dependency Visualizer</h1>
      <UploadBox />
    </div>
  );
}
