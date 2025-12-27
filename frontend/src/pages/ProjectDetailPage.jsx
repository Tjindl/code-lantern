import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import OverviewTab from "../components/OverviewTab";
import ArchitectureTab from "../components/ArchitectureTab";
import DeepDiveTab from "../components/DeepDiveTab";

export default function ProjectDetailPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [analysisData, setAnalysisData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasLoaded = useRef(false);

  const navigate = useNavigate();
  const apiBase = 'http://localhost:8000';

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "architecture", label: "Architecture", icon: "🏗️" },
    { id: "deepDive", label: "Deep Dive", icon: "🔍" },
  ];

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    loadProjectData();
  }, []);

  async function loadProjectData() {
    console.log('[ProjectDetailPage] Loading project data...');
    setLoading(true);
    setError(null);

    try {
      const analyzeRes = await fetch(`${apiBase}/api/analyze`);
      if (!analyzeRes.ok) throw new Error(`Analysis failed: ${analyzeRes.status}`);
      const analysisResult = await analyzeRes.json();
      setAnalysisData(analysisResult);

      const summaryRes = await fetch(`${apiBase}/api/project-summary`);
      if (!summaryRes.ok) throw new Error(`Summary failed: ${summaryRes.status}`);
      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      setLoading(false);
    } catch (e) {
      console.error('[ProjectDetailPage] Error:', e);
      setError(e.message);
      setLoading(false);
    }
  }

  const handleNewProject = () => navigate("/");

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab summary={summary} loading={loading} error={error} onRetry={loadProjectData} />;
      case "architecture":
        return <ArchitectureTab analysisData={analysisData} loading={loading} />;
      case "deepDive":
        return <DeepDiveTab analysisData={analysisData} apiBase={apiBase} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white font-display bg-grid">
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none opacity-50" />

      {/* Header */}
      <header className="relative z-10 glass-dark sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <h1
                onClick={handleNewProject}
                className="text-2xl md:text-3xl font-extralight cursor-pointer hover:text-[var(--accent-cyan)] transition"
              >
                code lantern<span className="text-[var(--accent-cyan)]">_</span>
              </h1>

              {/* Project Name Badge */}
              {summary?.project_name && (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-[var(--text-muted)]">/</span>
                  <span className="text-white font-medium">{summary.project_name}</span>
                  {summary.project_source && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${summary.project_source === 'github'
                        ? 'bg-[#238636]/20 text-[#3fb950]'
                        : 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]'
                      }`}>
                      {summary.project_source === 'github' ? '🔗 GitHub' : '📁 Upload'}
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={handleNewProject}
                className="btn-secondary !py-1.5 !px-4 text-sm hidden md:flex items-center gap-2"
              >
                <span>+</span> New Project
              </button>
            </div>

            {/* Tab Navigation */}
            <nav className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${activeTab === tab.id
                      ? "bg-[var(--accent-cyan)] text-black"
                      : "text-[var(--text-secondary)] hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="animate-fade-in">
          {renderTab()}
        </div>
      </main>
    </div>
  );
}