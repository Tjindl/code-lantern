import React from "react";

export default function UploadPage() {
    return (
      <div className="w-screen h-screen flex justify-between items-center bg-[#1A1D1E] shadow-lg border border-black px-32">
        {/* LEFT: Title + tagline */}
        <div>
          <h1
            className="text-white font-[100] text-[128px] font-['JetBrains_Mono'] leading-none"
            style={{ width: "674px", height: "333px" }}
          >
            code<br />
            lantern_
          </h1>
  
          <p className="mt-4 text-[24px] font-bold font-['JetBrains_Mono'] leading-none">
            <span className="text-[#4FB3FF]">illuminate</span>{" "}
            <span className="text-white">your code</span>
          </p>
        </div>
  
        {/* RIGHT: Description + upload box */}
        <div className="flex flex-col items-start space-y-6">
          {/* Text description */}
          <div className="w-[486px] h-[68px] text-white font-['JetBrains_Mono'] text-2xl font-bold leading-normal">
            Generate architecture maps, developer docs, and dependency insights automatically.
          </div>
  
          {/* Upload rectangle */}
          <div className="w-[452px] h-[179px] border border-white bg-transparent rounded-lg flex flex-col items-center justify-start p-4">
            {/* Title inside rectangle */}
            <p className="text-white font-['JetBrains_Mono'] text-2xl font-bold mb-3">
              Upload Repo (.zip)
            </p>
  
            {/* Choose File button */}
            <button
                className="w-[380px] h-[38px] bg-white border border-black rounded-[10px] shadow-md 
                            text-black font-['JetBrains_Mono'] text-base font-thin 
                            hover:bg-gray-200 transition"
                onClick={() => window.location.href = '/project'} // temporary navigation
            >
                Choose File
            </button>

  
            {/* Drag and drop text */}
            <p className="mt-3 text-white font-['JetBrains_Mono'] text-sm font-light">
              drag and drop supported
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  

