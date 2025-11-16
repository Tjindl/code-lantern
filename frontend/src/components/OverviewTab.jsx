import React from "react";

export default function OverviewTab({ repoMeta }) {
  return (
    <div className="w-full h-full flex justify-center items-center">
      {/* Outer Rectangle */}
      <div className="w-[1242px] h-[744px] rounded-[10px] border border-white bg-transparent flex justify-between items-stretch px-10 py-8">
        {/* Left Section - Overview Text */}
        <div className="w-[600px] text-white font-['JetBrains_Mono'] flex flex-col justify-start">
          <h2 className="text-[28px] font-bold mb-4">repository overview</h2>
          <p className="text-[18px] text-[#D9D9D9] leading-relaxed">
            {repoMeta?.summary || "Loading summary..."}
          </p>
        </div>

        {/* Vertical Divider Line */}
        <div className="w-[1px] bg-white self-stretch mx-8" />

        {/* Right Section - Summary Info */}
        <div className="w-[400px] text-white font-['JetBrains_Mono'] flex flex-col justify-start">
          <h3 className="text-[24px] font-bold mb-2">summary</h3>
          <p className="text-[20px] font-bold mb-4">
            this repository contains:
          </p>
          <div className="text-[18px] space-y-2">
            <p>Files: {repoMeta?.files ?? "—"}</p>
            <p>
              Languages:{" "}
              {repoMeta?.languages?.length
                ? repoMeta.languages.join(" • ")
                : "—"}
            </p>
          </div>
          <div className="text-[20px] font-bold mt-6">
            <span className="text-[#4FB3FF]">code growth over time:</span>{" "}
            {repoMeta?.growth90d != null ? `+${repoMeta.growth90d}%` : "—"}
          </div>
          <div className="text-[20px] font-bold mt-2">
            <span className="text-[#00E0B8]">Overall code health:</span>{" "}
            {repoMeta?.healthScore ?? "—"}
          </div>
        </div>
      </div>
    </div>
  );
}







  

  