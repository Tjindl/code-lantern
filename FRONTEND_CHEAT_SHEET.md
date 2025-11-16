# 🚀 Code Lantern API - Frontend Quick Reference

## 📡 All Endpoints

```
POST   /api/upload                     # Upload ZIP file
GET    /api/analyze/{repo_id}          # Get architecture JSON  
GET    /api/files/{repo_id}            # Get file browser data
GET    /api/function/{repo_id}         # Get function details
GET    /api/project-summary/{repo_id}  # Get project analytics
```

## 🔄 Complete Workflow

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

## 📊 Project Summary Data

```javascript
// What you get from /api/project-summary/{repo_id}
{
  project_stats: {
    file_stats: {
      total_files: 8,
      file_extensions: {".py": 5, ".js": 2},
      estimated_lines_of_code: 1250
    },
    function_stats: {
      total_functions: 23,
      average_complexity: 4.2,
      functions_per_file: 2.9
    },
    language_stats: {
      primary_language: "Python",
      language_percentages: {"Python": 71.4, "JavaScript": 28.6}
    },
    complexity_metrics: {
      code_health_score: 87,        // 0-100
      project_size: "Medium",       // Small/Medium/Large
      architecture_complexity: "Moderate"  // Simple/Moderate/Complex
    }
  },
  ai_summary: {
    overview: "Well-structured web application...",
    strengths: ["Clean architecture", "Good organization"],
    recommendations: ["Add unit tests", "Implement logging"],
    architecture_insights: "Project follows MVC patterns...",
    technology_assessment: "Modern Python/JavaScript stack..."
  }
}
```

## 🎨 Dashboard Components

### Health Score Widget
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

### Stats Grid
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

### AI Insights Panel
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

## 🎯 Frontend Pages

1. **Upload Page** - File upload + basic results
2. **Dashboard Page** - Project summary with health scores
3. **File Browser** - Navigate files and functions
4. **Function Details** - Individual function analysis

## 🔧 Error Handling

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
    return null;
  }
}
```