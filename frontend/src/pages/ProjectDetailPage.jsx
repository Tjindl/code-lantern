import React, { useState } from "react";
import OverviewTab from "../components/OverviewTab";
import ArchitectureTab from "../components/ArchitectureTab";
import DeepDiveTab from "../components/DeepDiveTab";

export default function ProjectDetailPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const apiBase = window.__API_BASE__ || 'http://localhost:8000';

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

  async function onRunAnalysis() {
    setStatus('analyzing'); setError(null);
    try {
      const res = await fetch(`${apiBase}/api/analyze`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('analyzed');
    } catch (e) {
      setStatus('error');
      setError(e.message || String(e));
    }
  }

  async function onReloadSummary() {
    setStatus('loading'); setError(null);
    try {
      const res = await fetch(`${apiBase}/api/project-summary`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      console.log('[ProjectDetailPage] Summary response:', json);
      console.log('[ProjectDetailPage] AI summary:', json.ai_summary);
      setSummary(json);
      setStatus('ready');
    } catch (e) {
      setStatus('error');
      setError(e.message || String(e));
    }
  }

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            status={status}
            error={error}
            summary={summary}
            onRunAnalysis={onRunAnalysis}
            onReloadSummary={onReloadSummary}
          />
        );
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