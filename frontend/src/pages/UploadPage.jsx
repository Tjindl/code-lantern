import React, { useRef, useState } from "react";
import { uploadProjectZip } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".zip")) {
      alert("Please upload a .zip file only!");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadProjectZip(file);
      console.log('[Upload] Success:', result);
      // Navigate to project detail page
      navigate("/project");
    } catch (error) {
      console.error('[Upload] Error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-between items-center bg-[#1A1D1E] px-16 gap-16">
      {/* LEFT: Title + tagline */}
      <div className="flex flex-col justify-center flex-shrink-0">
        <h1 className="text-white font-[100] text-[128px] font-['JetBrains_Mono'] leading-none">
          code<br />
          lantern_
        </h1>

        <p className="mt-4 text-[24px] font-bold font-['JetBrains_Mono'] leading-none">
          <span className="text-[#4FB3FF]">illuminate</span>{" "}
          <span className="text-white">your code</span>
        </p>
      </div>

      {/* RIGHT: Upload section */}
      <div className="flex flex-col items-start space-y-6 flex-shrink-0">
        <div className="w-[486px] text-white font-['JetBrains_Mono'] text-2xl font-bold leading-normal">
          generate architecture maps, developer docs, and dependency insights automatically
        </div>

        <div className="w-[452px] border border-white bg-transparent rounded-lg flex flex-col items-center justify-start p-8">
          <p className="text-white font-['JetBrains_Mono'] text-2xl font-bold mb-3">
            upload repo (.zip)
          </p>

          <input
            type="file"
            accept=".zip"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            className="w-[380px] h-[38px] bg-white border border-black rounded-[10px] shadow-md 
                        text-black font-['JetBrains_Mono'] text-base font-thin 
                        hover:bg-gray-200 transition"
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
          >
            {uploading ? "uploading..." : "choose file"}
          </button>

          <p className="mt-3 text-white font-['JetBrains_Mono'] text-sm font-light">
            drag and drop supported
          </p>
        </div>
      </div>
    </div>
  );
}







