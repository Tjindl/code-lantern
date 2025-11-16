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

| Method | Endpoint | Purpose | Frontend Page |
|--------|----------|---------|---------------|
| `POST` | `/api/upload` | Upload ZIP file | Upload Page |
| `GET` | `/api/analyze/{repo_id}` | Generate architecture map | Upload Page |
| `GET` | `/api/files/{repo_id}` | Get file browser data | File Browser Page |
| `GET` | `/api/function/{repo_id}` | Get AI function details | Function Details Page |

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

### 2. Analyze Project
```http
GET /api/analyze/{repo_id}
```

**Response:**
```json
{
  "status": "ok",
  "repo_id": "uuid-string", 
  "files_analyzed": 5,
  "architecture_map": {
    "listOfFiles": [
      {
        "filePath": "src/main.py",
        "listOfFunctions": [
          {
            "functionName": "src/main.py-process_data",
            "calls": ["validate_input", "save_result"]
          }
        ]
      }
    ]
  }
}
```

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