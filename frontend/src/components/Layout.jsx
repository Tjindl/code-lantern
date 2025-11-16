// src/components/Layout.jsx
import React from "react";

export default function Layout({ children, activeTab, setActiveTab, hasRepo }) {
  const tabs = [
    { id: "overview", label: "overview", width: "189px" },
    { id: "architecture", label: "architecture", width: "257px" },
    { id: "deepDive", label: "deep dive", width: "200px" },
  ];

  return (
    <div className="w-screen h-screen bg-[#1A1D1E] text-white font-['JetBrains_Mono']">
      {/* Header */}
      <header className="flex items-end justify-between px-16 pt-10 pb-4 border-b border-[#333] shadow-md">
        <div className="text-[48px] font-extralight h-[73px] leading-none">
          code&nbsp;lantern_
        </div>

        {hasRepo && (
          <nav className="flex gap-6 items-end">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`h-[25px] text-[24px] font-bold border-b-2 ${
                  activeTab === tab.id
                    ? "border-[#00E0B8]"
                    : "border-transparent hover:border-[#4FB3FF]"
                }`}
                style={{ width: tab.width, textAlign: "left" }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main className="p-12">{children}</main>
    </div>
  );
}
