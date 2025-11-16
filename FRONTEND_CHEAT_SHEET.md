# 🚀 Code Lantern API - Frontend Developer Cheat Sheet

## Quick Reference for Frontend Integration

### 📡 **All Endpoints Overview**

```bash
BASE_URL: http://localhost:8000

POST   /api/upload                     # Upload ZIP file
GET    /api/analyze/{repo_id}          # Get architecture JSON  
GET    /api/files/{repo_id}            # Get file browser data
GET    /api/function/{repo_id}         # Get function details
GET    /api/project-summary/{repo_id}  # Get project analytics (NEW!)
```

### 🔄 **Complete Workflow**

```javascript
// 1. Upload project
const uploadResponse = await fetch('/api/upload', {
    method: 'POST',
    body: formData  // ZIP file
});
const { repo_id } = await uploadResponse.json();

// 2. Analyze architecture  
const archResponse = await fetch(`/api/analyze/${repo_id}`);
const { architecture_map } = await archResponse.json();

// 3. Get project summary (for dashboard)
const summaryResponse = await fetch(`/api/project-summary/${repo_id}`);
const { project_stats, ai_summary } = await summaryResponse.json();

// 4. Get file browser data
const filesResponse = await fetch(`/api/files/${repo_id}`);
const { files, totalFiles } = await filesResponse.json();

// 5. Get function details (when user clicks a function)
const funcResponse = await fetch(`/api/function/${repo_id}?file_path=${file}&function_name=${func}`);
const { details } = await funcResponse.json();
```

### 📊 **Project Summary Data Structure**

```javascript
// What you get from /api/project-summary/{repo_id}
{
  project_stats: {
    file_stats: {
      total_files: 8,                           // Number of files
      file_extensions: {".py": 5, ".js": 2},    // File type breakdown  
      estimated_lines_of_code: 1250             // Total lines
    },
    function_stats: {
      total_functions: 23,                      // Total functions
      average_complexity: 4.2,                 // Avg calls per function
      functions_per_file: 2.9                  // Functions/file ratio
    },
    language_stats: {
      primary_language: "Python",              // Main language
      language_percentages: {                  // % breakdown
        "Python": 71.4, 
        "JavaScript": 28.6
      }
    },
    complexity_metrics: {
      code_health_score: 87,                   // 0-100 health score
      project_size: "Medium",                  // Small/Medium/Large
      architecture_complexity: "Moderate"      // Simple/Moderate/Complex
    }
  },
  ai_summary: {
    overview: "Well-structured web application...",           // AI description
    strengths: ["Clean architecture", "Good organization"],   // What's good
    recommendations: ["Add unit tests", "Implement logging"], // Suggestions
    architecture_insights: "Project follows MVC patterns...", // Architecture
    technology_assessment: "Modern Python/JavaScript stack..." // Tech review
  }
}
```

### 🎨 **Dashboard Component Examples**

#### Health Score Widget
```javascript
function HealthScore({ score, projectSize }) {
  const getColor = (score) => {
    if (score >= 80) return '#4CAF50';  // Green
    if (score >= 60) return '#FF9800';  // Orange  
    return '#F44336';                   // Red
  };
  
  return (
    <div className="health-widget">
      <h3>Code Health</h3>
      <div style={{ color: getColor(score), fontSize: '2rem' }}>
        {score}/100
      </div>
      <p>{projectSize} Project</p>
    </div>
  );
}
```

#### Language Breakdown
```javascript
function LanguageChart({ languagePercentages, primaryLanguage }) {
  const chartData = Object.entries(languagePercentages).map(([lang, percent]) => ({
    name: lang,
    value: percent,
    fill: getLanguageColor(lang)
  }));
  
  return (
    <div className="language-widget">
      <h3>Languages</h3>
      <PieChart data={chartData} />
      <p>Primary: {primaryLanguage}</p>
    </div>
  );
}
```

#### Project Stats Grid
```javascript
function StatsGrid({ fileStats, functionStats }) {
  const stats = [
    { label: 'Files', value: fileStats.total_files, icon: '📄' },
    { label: 'Functions', value: functionStats.total_functions, icon: '⚙️' },
    { label: 'Lines', value: fileStats.estimated_lines_of_code.toLocaleString(), icon: '📏' },
    { label: 'Complexity', value: functionStats.average_complexity.toFixed(1), icon: '📊' }
  ];
  
  return (
    <div className="stats-grid">
      {stats.map(stat => (
        <div key={stat.label} className="stat-card">
          <span className="icon">{stat.icon}</span>
          <span className="value">{stat.value}</span>
          <span className="label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
```

#### AI Insights Panel
```javascript
function AIInsights({ aiSummary }) {
  return (
    <div className="ai-insights">
      <h3>🤖 AI Analysis</h3>
      
      <div className="overview">
        <h4>Overview</h4>
        <p>{aiSummary.overview}</p>
      </div>
      
      <div className="strengths">
        <h4>💪 Strengths</h4>
        <ul>
          {aiSummary.strengths.map((strength, i) => (
            <li key={i}>{strength}</li>
          ))}
        </ul>
      </div>
      
      <div className="recommendations">
        <h4>💡 Recommendations</h4>
        <ul>
          {aiSummary.recommendations.map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

### 🎯 **Frontend Page Structure**

1. **Upload Page** - File upload + basic analysis results
2. **Dashboard Page** - Project summary with health scores (NEW!)  
3. **File Browser** - Navigate files and functions
4. **Function Details** - Individual function analysis

### 🔧 **Error Handling**

```javascript
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error.message);
    // Show user-friendly error message
    return null;
  }
}
```

---

**Ready to build a comprehensive code analysis dashboard!** 🎉

For questions, check the full integration guide or API documentation.