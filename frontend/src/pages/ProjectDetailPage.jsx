
import React, { useState } from "react";
import OverviewTab from "../components/OverviewTab";
import ArchitectureTab from "../components/ArchitectureTab";
import DeepDiveTab from "../components/DeepDiveTab";

export default function ProjectDetailPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "overview", width: "189px" },
    { id: "architecture", label: "architecture", width: "257px" },
    { id: "deepDive", label: "deep dive", width: "200px" },
  ];

  const repoMeta = {
    summary:
      "This repository contains backend and frontend modules for a dependency-visualization tool.",
    files: 42,
    languages: ["JavaScript", "Python", "CSS"],
    growth90d: 18,
    healthScore: "A-",
  };

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab repoMeta={repoMeta} />;
      case "architecture":
        return <ArchitectureTab />;
      case "deepDive":
        return <DeepDiveTab />;
      default:
        return null;
    }
  };

  return (
    <div className="w-screen h-screen bg-[#1A1D1E] text-white font-['JetBrains_Mono'] flex flex-col">
      {/* Header */}
      <header className="flex items-end justify-between px-16 pt-10 pb-4 border-b border-[#333] shadow-md">
        <div className="text-[48px] font-extralight h-[73px] leading-none">
          code&nbsp;lantern_
        </div>

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
      </header>

      {/* Tab Content */}
      <main className="flex-1 p-12 flex justify-center items-center overflow-hidden">
        {renderTab()}
      </main>
    </div>
  );
}
