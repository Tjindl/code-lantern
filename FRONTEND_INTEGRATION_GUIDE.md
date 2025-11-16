# 🏮 Code Lantern - Frontend Integration Guide

## 🚀 Backend Setup Complete & Ready

### Quick Start for Frontend Team
```bash
# Backend is already running at:
http://localhost:8000

# API Documentation:
http://localhost:8000/docs (Interactive Swagger UI)
```

## 📊 API Endpoints Overview

### Base URL: `http://localhost:8000`

| Method | Endpoint | Purpose | Frontend Page | Returns |
|--------|----------|---------|---------------|---------|
| `POST` | `/api/upload` | Upload ZIP file | Upload Page | repo_id |
| `GET` | `/api/analyze/{repo_id}` | **Generate full architecture JSON** | Upload Page | **Complete architecture_map** |
| `GET` | `/api/files/{repo_id}` | Get simplified file browser data | File Browser Page | File list with function names |
| `GET` | `/api/function/{repo_id}` | Get AI function details | Function Details Page | AI-powered insights |
| `GET` | `/api/project-summary/{repo_id}` | **Get comprehensive project analysis** | Dashboard Page | **AI summary & statistics** |

---

# 📋 Complete API Endpoint Summary for Frontend Team

## 🚀 All Available Endpoints:

### 1. **Upload Project**
- **Method:** `POST`
- **URL:** `/api/upload`  
- **Purpose:** Upload ZIP file and get repo_id
- **Returns:** `{ repo_id, status, extracted_to }`

### 2. **Analyze Architecture** 
- **Method:** `GET`
- **URL:** `/api/analyze/{repo_id}`
- **Purpose:** Generate complete project architecture JSON
- **Returns:** `{ architecture_map, files_analyzed, status }`
- **Use for:** Architecture visualization, function relationships

### 3. **Get File Browser Data**
- **Method:** `GET` 
- **URL:** `/api/files/{repo_id}`
- **Purpose:** Get simplified file list with function counts
- **Returns:** `{ files, totalFiles, status }`
- **Use for:** File navigation, function lists

### 4. **Get Function Details**
- **Method:** `GET`
- **URL:** `/api/function/{repo_id}?file_path=...&function_name=...`
- **Purpose:** Get AI-powered function analysis
- **Returns:** `{ details: { inputs, outputs, description }, status }`
- **Use for:** Function detail pages, AI insights

### 5. **Get Project Summary** ⭐ NEW!
- **Method:** `GET`
- **URL:** `/api/project-summary/{repo_id}`
- **Purpose:** Get comprehensive project analytics with AI insights
- **Returns:** `{ project_stats, ai_summary, status }`
- **Use for:** Project dashboard, analytics, health scores

## 🎯 Recommended Frontend Flow:

1. **Upload** → Get `repo_id`
2. **Analyze** → Get architecture for visualization  
3. **Get Summary** → Show project dashboard with stats
4. **Browse Files** → Navigate project structure
5. **Function Details** → Show individual function analysis

## 📊 Data You Get for Project Dashboard:

### **Project Statistics:**
```json
{
  "file_stats": {
    "total_files": 8,
    "file_extensions": {".py": 5, ".js": 2},
    "estimated_lines_of_code": 1250
  },
  "function_stats": {
    "total_functions": 23,
    "average_complexity": 4.2,
    "functions_per_file": 2.9
  },
  "language_stats": {
    "primary_language": "Python",
    "language_percentages": {"Python": 71.4, "JavaScript": 28.6}
  },
  "complexity_metrics": {
    "code_health_score": 87,
    "project_size": "Medium", 
    "architecture_complexity": "Moderate"
  }
}
```

### **AI-Generated Insights:**
```json
{
  "ai_summary": {
    "overview": "Well-structured web application...",
    "strengths": ["Clean architecture", "Good organization"],
    "recommendations": ["Add unit tests", "Implement logging"],
    "architecture_insights": "Project follows MVC patterns...",
    "technology_assessment": "Modern Python/JavaScript stack..."
  }
}
```

## 🎨 Frontend Implementation Tips:

### **Dashboard Cards:**
```javascript
// Code Health Score Card
<div className="health-score-card">
  <h3>Code Health</h3>
  <div className="score" style={{color: getHealthColor(score)}}>
    {project_stats.complexity_metrics.code_health_score}/100
  </div>
  <p>{project_stats.complexity_metrics.project_size} Project</p>
</div>

// Language Breakdown Card  
<div className="language-card">
  <h3>Programming Languages</h3>
  <PieChart data={languagePercentages} />
  <p>Primary: {language_stats.primary_language}</p>
</div>
```

### **Statistics Grid:**
```javascript
const stats = [
  { label: "Files", value: file_stats.total_files, icon: "📄" },
  { label: "Functions", value: function_stats.total_functions, icon: "⚙️" },
  { label: "Lines of Code", value: file_stats.estimated_lines_of_code, icon: "📏" },
  { label: "Complexity", value: function_stats.average_complexity, icon: "📈" }
];
```

### **AI Insights Section:**
```javascript
<div className="ai-insights">
  <h3>🤖 AI Analysis</h3>
  <p className="overview">{ai_summary.overview}</p>
  
  <div className="strengths">
    <h4>💪 Strengths</h4>
    <ul>
      {ai_summary.strengths.map(strength => <li key={strength}>{strength}</li>)}
    </ul>
  </div>
  
  <div className="recommendations">
    <h4>💡 Recommendations</h4>
    <ul>
      {ai_summary.recommendations.map(rec => <li key={rec}>{rec}</li>)}
    </ul>
  </div>
</div>
```

---

## 🔒 Security Notice

**IMPORTANT: Never commit API keys!**

The `.env` file containing your Gemini API key is excluded from Git. Always use `.env.example` as a template.

```bash
# ✅ Safe - Template file
.env.example  

# ❌ Sensitive - Never commit  
.env          
```

To set up API keys:
1. Copy `.env.example` to `.env`
2. Add your actual Gemini API key
3. The `.gitignore` file will protect your secrets

---

## 🔄 Complete User Flow

### Page 1: Upload & Architecture Overview
```javascript
// 1. Upload ZIP file
const formData = new FormData();
formData.append('file', zipFile);
const uploadRes = await fetch('/api/upload', {
    method: 'POST', 
    body: formData
});
const { repo_id } = await uploadRes.json();

// 2. Generate architecture map  
const analysisRes = await fetch(`/api/analyze/${repo_id}`);
const { architecture_map, files_analyzed } = await analysisRes.json();

// 3. Show overview stats and navigate to file browser
```

### Page 2: File Browser
```javascript
// Get file list with function counts
const filesRes = await fetch(`/api/files/${repo_id}`);
const { files, totalFiles } = await filesRes.json();

// Display files like:
// 📄 user_service.py (3 functions)
//   - create_user
//   - validate_email  
//   - generate_id
```

### Page 3: Function Details
```javascript
// When user clicks a function
const detailsRes = await fetch(
    `/api/function/${repo_id}?file_path=${filePath}&function_name=${funcName}`
);
const { details } = await detailsRes.json();

// Show AI-powered insights:
// Name, Inputs, Outputs, Description
```

### Page 4: Project Dashboard (NEW - AI Analytics)
```javascript
// Get comprehensive project analytics
const summaryRes = await fetch(`/api/project-summary/${repo_id}`);
const { project_stats, ai_summary } = await summaryRes.json();

// Display project dashboard with:
// - File count, lines of code, languages used
// - Code health score out of 100
// - AI-generated strengths and recommendations
// - Technology assessment and architecture insights
```

---

# 🎯 Complete Frontend Pages Structure

## Page 1: Upload & Overview
**Purpose:** Upload ZIP and show basic project info  
**API Calls:** `/api/upload`, `/api/analyze/{repo_id}`  
**Data Displayed:**
- Upload progress and status
- Total files analyzed  
- Architecture map preview
- Navigation to detailed analysis

## Page 2: Project Dashboard (NEW!)
**Purpose:** Comprehensive project analytics  
**API Call:** `/api/project-summary/{repo_id}`  
**Data Displayed:**
- 📊 **File Statistics:** Count, types, lines of code
- 🎯 **Code Health Score:** 0-100 with color coding
- 💻 **Language Breakdown:** Pie chart of programming languages
- 📈 **Complexity Metrics:** Project size, architecture complexity
- 🤖 **AI Insights:** Overview, strengths, recommendations

## Page 3: File Browser  
**Purpose:** Navigate project structure  
**API Call:** `/api/files/{repo_id}`  
**Data Displayed:**
- File list with function counts
- Expandable file sections
- Function name lists per file
- Navigation to function details

## Page 4: Function Details
**Purpose:** AI-powered function analysis  
**API Call:** `/api/function/{repo_id}?file_path=...&function_name=...`  
**Data Displayed:**
- Function inputs and outputs
- AI-generated description
- Function purpose and behavior

---

## 📝 Detailed API Specifications

### 1. Upload Project
```http
POST /api/upload
Content-Type: multipart/form-data

Body: file (ZIP file)
```

**Response:**
```json
{
  "status": "ok",
  "repo_id": "uuid-string",
  "extracted_to": "processed_repos/uuid-string"
}
```

### 2. Analyze Project (MAIN ARCHITECTURE ENDPOINT)
```http
GET /api/analyze/{repo_id}
```

**⭐ This is the main endpoint that returns the complete architecture JSON!**

**Response:**
```json
{
  "status": "ok",
  "repo_id": "uuid-string", 
  "files_analyzed": 5,
  "json_path": "processed_repos/uuid-string/architecture_map.json",
  "architecture_map": {
    "listOfFiles": [
      {
        "filePath": "/Users/username/Code/project/processed_repos/uuid/src/main.py",
        "listOfFunctions": [
          {
            "functionName": "/Users/username/Code/project/processed_repos/uuid/src/main.py-process_data",
            "calls": ["validate_input", "save_result"]
          },
          {
            "functionName": "/Users/username/Code/project/processed_repos/uuid/src/main.py-validate_input", 
            "calls": ["check_format", "sanitize"]
          }
        ]
      },
      {
        "filePath": "/Users/username/Code/project/processed_repos/uuid/src/utils.js",
        "listOfFunctions": [
          {
            "functionName": "/Users/username/Code/project/processed_repos/uuid/src/utils.js-formatData",
            "calls": ["parseJSON", "validateSchema"]
          }
        ]
      }
    ]
  }
}
```

**💡 This endpoint provides:**
- ✅ **Complete project architecture** as JSON
- ✅ **All files and their functions** with absolute paths
- ✅ **Function call relationships** (who calls what)
- ✅ **Absolute file paths** for precise file identification

---

# 🏗️ Architecture JSON Structure

The main architecture endpoint `/api/analyze/{repo_id}` returns a complete JSON structure following this format:

```json
{
  "listOfFiles": [
    {
      "filePath": "/absolute/path/to/processed_repos/uuid/relative/path/to/file.py",
      "listOfFunctions": [
        {
          "functionName": "/absolute/path/to/processed_repos/uuid/file.py-function_name",
          "calls": ["other_function", "another_function"]
        }
      ]
    }
  ]
}
```

### Key Components:

- **listOfFiles**: Array of all analyzed files
- **filePath**: Absolute path to the file on the server
- **listOfFunctions**: All functions found in that file
- **functionName**: Format: `{absoluteFilePath}-{functionName}`
- **calls**: Array of function names this function calls

This structure enables:
- 🔗 **Function dependency mapping**
- 📊 **Architecture visualization**
- 🔍 **Code relationship analysis**
- 📈 **Complexity metrics**

---

### 3. Get File Browser Data
```http
GET /api/files/{repo_id}
```

**Response:**
```json
{
  "status": "ok",
  "repo_id": "uuid-string",
  "totalFiles": 3,
  "files": [
    {
      "filePath": "user_service.py",
      "functionCount": 3,
      "functions": ["create_user", "validate_email", "generate_id"]
    },
    {
      "filePath": "utils.js", 
      "functionCount": 2,
      "functions": ["calculateTotal", "formatCurrency"]
    }
  ]
}
```

### 4. Get Function Details (AI-Powered)
```http
GET /api/function/{repo_id}?file_path={file}&function_name={function}
```

**Response:**
```json
{
  "status": "ok",
  "repo_id": "uuid-string",
  "file_path": "user_service.py", 
  "details": {
    "function_name": "create_user",
    "inputs": "username (str), email (str), age (int) - User registration data",
    "outputs": "dict - User object with id, username, email, age and metadata",
    "description": "Creates a new user account with validation. Checks age requirement (18+), generates unique ID, and saves to database."
  }
}
```

### 5. Get Project Summary (AI-Powered Analysis)
```http
GET /api/project-summary/{repo_id}
```

**⭐ This endpoint provides comprehensive AI analysis of the uploaded project!**

**Response:**
```json
{
  "status": "ok",
  "repo_id": "uuid-string",
  "project_stats": {
    "file_stats": {
      "total_files": 8,
      "file_extensions": {".py": 5, ".js": 2, ".json": 1},
      "estimated_lines_of_code": 1250
    },
    "function_stats": {
      "total_functions": 23,
      "total_function_calls": 67,
      "average_complexity": 4.2,
      "max_complexity": 12,
      "functions_per_file": 2.9
    },
    "language_stats": {
      "languages": {"Python": 5, "JavaScript": 2},
      "language_percentages": {"Python": 71.4, "JavaScript": 28.6},
      "primary_language": "Python"
    },
    "complexity_metrics": {
      "code_health_score": 87,
      "project_size": "Medium", 
      "architecture_complexity": "Moderate"
    }
  },
  "ai_summary": {
    "overview": "Well-structured web application with clean separation of concerns",
    "strengths": ["Clean architecture", "Good function organization", "Modern technology stack"],
    "recommendations": ["Add unit tests", "Implement error logging", "Consider API documentation"],
    "architecture_insights": "Project follows MVC patterns with clear component separation",
    "technology_assessment": "Modern Python/JavaScript stack with appropriate frameworks"
  },
  "generated_at": "2024-01-15T10:30:45"
}
```

**💡 This endpoint provides:**
- 📊 **Detailed Project Statistics** - Files, functions, lines of code
- 🎯 **Code Health Score** - Overall project quality (0-100)
- 🗣️ **AI-Generated Insights** - Strengths, recommendations, architecture analysis
- 📈 **Language Breakdown** - Programming languages and percentages
- 🏗️ **Complexity Metrics** - Project size and architecture complexity

---

# 📊 Project Summary Data Structure

The project summary endpoint provides comprehensive analytics about uploaded projects. Here's how to use the data:

## Frontend Usage Examples:

### 1. Display Project Statistics
```javascript
const { project_stats } = summaryData;

// File statistics
const fileStats = project_stats.file_stats;
console.log(`Total Files: ${fileStats.total_files}`);
console.log(`Lines of Code: ${fileStats.estimated_lines_of_code}`);
console.log(`File Types:`, fileStats.file_extensions);

// Function statistics  
const funcStats = project_stats.function_stats;
console.log(`Total Functions: ${funcStats.total_functions}`);
console.log(`Average Complexity: ${funcStats.average_complexity}`);
console.log(`Functions per File: ${funcStats.functions_per_file}`);
```

### 2. Display Language Breakdown
```javascript
const langStats = project_stats.language_stats;
console.log(`Primary Language: ${langStats.primary_language}`);

// Create pie chart data
const chartData = Object.entries(langStats.language_percentages).map(([lang, percent]) => ({
  name: lang,
  value: percent
}));
```

### 3. Show Code Health Score
```javascript
const complexity = project_stats.complexity_metrics;
const healthScore = complexity.code_health_score;

// Display health score with color coding
const getHealthColor = (score) => {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow'; 
  return 'red';
};

console.log(`Code Health: ${healthScore}/100 (${complexity.project_size})`);
```

### 4. Display AI Insights
```javascript
const aiSummary = summaryData.ai_summary;

// Project overview
document.getElementById('overview').textContent = aiSummary.overview;

// Strengths list
const strengthsList = document.getElementById('strengths');
aiSummary.strengths.forEach(strength => {
  const li = document.createElement('li');
  li.textContent = strength;
  strengthsList.appendChild(li);
});

// Recommendations
const recommendationsList = document.getElementById('recommendations');
aiSummary.recommendations.forEach(rec => {
  const li = document.createElement('li');
  li.textContent = rec;
  recommendationsList.appendChild(li);
});
```

---

## 🎨 Frontend Implementation Suggestions

### File Upload Component
```javascript
function FileUploader({ onUpload }) {
  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    onUpload(result.repo_id);
  };

  return (
    <div className="upload-dropzone">
      <input type="file" accept=".zip" onChange={handleFileUpload} />
      <p>Drop your ZIP file here or click to browse</p>
    </div>
  );
}
```

### File Browser Component  
```javascript
function FileBrowser({ repoId }) {
  const [files, setFiles] = useState([]);
  
  useEffect(() => {
    fetch(`/api/files/${repoId}`)
      .then(res => res.json())
      .then(data => setFiles(data.files));
  }, [repoId]);

  return (
    <div className="file-browser">
      {files.map(file => (
        <FileItem key={file.filePath} file={file} repoId={repoId} />
      ))}
    </div>
  );
}
```

### Function Details Component
```javascript
function FunctionDetails({ repoId, filePath, functionName }) {
  const [details, setDetails] = useState(null);
  
  useEffect(() => {
    const url = `/api/function/${repoId}?file_path=${filePath}&function_name=${functionName}`;
    fetch(url)
      .then(res => res.json()) 
      .then(data => setDetails(data.details));
  }, [repoId, filePath, functionName]);

  return (
    <div className="function-details">
      <h2>{details?.function_name}</h2>
      <div className="detail-section">
        <h3>Inputs</h3>
        <p>{details?.inputs}</p>
      </div>
      <div className="detail-section">
        <h3>Outputs</h3>
        <p>{details?.outputs}</p>
      </div>
      <div className="detail-section">
        <h3>Description</h3>
        <p>{details?.description}</p>
      </div>
    </div>
  );
}
```

---

## 🛡️ Error Handling

### Common Error Responses
```json
// File not found
{ "detail": "Repository not found" }

// Invalid file type  
{ "detail": "Only ZIP files are allowed" }

// Analysis not complete
{ "detail": "Architecture map not found. Run analysis first." }

// Function not found
{ "detail": "Function not found in file" }
```

### Frontend Error Handling
```javascript
const handleApiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'API Error');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error.message);
    // Show user-friendly error message
  }
};
```

---

## 🎯 Key Features for Frontend

### ✅ Must Have
- ZIP file upload with progress
- Architecture overview with stats  
- File browser with function lists
- Function details with AI descriptions
- Loading states and error handling

### 🚀 Nice to Have
- Visual architecture graph/diagram
- Search functionality for functions
- Export architecture as PDF/Image
- Dark/light theme toggle
- Function call relationship visualization

---

## 🔧 Backend Status

✅ **All endpoints working**
✅ **CORS enabled for all origins** 
✅ **Gemini AI integration active**
✅ **Error handling implemented**
✅ **Lightweight responses (no code bloat)**
✅ **Architecture map generation**
✅ **Function extraction for Python/JS/TS**

---

## 📞 Support

Backend is ready for frontend integration. All endpoints tested and functional.

**Test the API:**
- Interactive docs: http://localhost:8000/docs
- Health check: http://localhost:8000/

Ready to build an amazing code analysis experience! 🚀