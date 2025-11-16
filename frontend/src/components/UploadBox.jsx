import React, { useState } from "react";
import { uploadProjectZip } from "../services/api";

export default function UploadBox() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith(".zip")) {
      setFile(selectedFile);
    } else {
      alert("Please upload a valid .zip file");
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please select a zip file first");
      return;
    }
    setUploading(true);
    try {
      const result = await uploadProjectZip(file);
      console.log("Backend response:", result);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Upload failed. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <input type="file" accept=".zip" onChange={handleFileChange} />
      <button onClick={handleAnalyze} disabled={!file || uploading}>
        {uploading ? "Uploading..." : "Analyze"}
      </button>
    </div>
  );
}