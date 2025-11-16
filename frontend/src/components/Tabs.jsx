export default function Tabs({ activeTab, setActiveTab }) {
    const tabs = [
      { key: "overview", label: "Overview" },
      { key: "architecture", label: "Architecture" },
      { key: "deepdive", label: "Deep Dive" },
    ];
  
    return (
      <div style={{ display: "flex", gap: "20px", borderBottom: "1px solid #ccc" }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              border: "none",
              background: "none",
              padding: "10px 20px",
              borderBottom: activeTab === tab.key ? "3px solid #4CAF50" : "none",
              fontWeight: activeTab === tab.key ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }
  