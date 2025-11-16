# API Documentation for Frontend Team
"""
CODE LANTERN BACKEND API DOCUMENTATION

Base URL: http://localhost:8000

## WORKFLOW:
1. Upload ZIP file to /api/upload
2. Use returned repo_id to analyze project via /api/analyze/{repo_id}
3. Get file list via /api/files/{repo_id}
4. Get function details via /api/function/{repo_id}?file_path=...&function_name=...

## ENDPOINTS:

### 1. Upload Project
POST /api/upload
Content-Type: multipart/form-data
Body: file (ZIP file)

Response (Success):
{
  "status": "ok",
  "repo_id": "63e61aef-7bcd-4fc9-a61b-3a37024409c2",
  "extracted_to": "processed_repos/63e61aef-7bcd-4fc9-a61b-3a37024409c2"
}

### 2. Analyze Project
GET /api/analyze/{repo_id}

Response (Success):
{
  "status": "ok",
  "repo_id": "63e61aef-7bcd-4fc9-a61b-3a37024409c2",
  "files_analyzed": 3,
  "json_path": "processed_repos/.../architecture_map.json",
  "architecture_map": {
    "listOfFiles": [
      {
        "filePath": "/absolute/path/to/processed_repos/uuid/src/main.py",
        "listOfFunctions": [
          {
            "functionName": "/absolute/path/to/processed_repos/uuid/src/main.py-hello_world",
            "calls": ["greet_user"]
          }
        ]
      }
    ]
  }
}

### 3. Get Project Files
GET /api/files/{repo_id}

Response (Success):
{
  "status": "ok",
  "repo_id": "63e61aef-7bcd-4fc9-a61b-3a37024409c2",
  "totalFiles": 2,
  "files": [
    {
      "filePath": "/absolute/path/to/processed_repos/uuid/src/user_service.py",
      "functionCount": 3,
      "functions": ["create_user", "validate_email", "generate_id"]
    },
    {
      "filePath": "/absolute/path/to/processed_repos/uuid/src/utils.js", 
      "functionCount": 2,
      "functions": ["calculateTotalPrice", "formatCurrency"]
    }
  ]
}

### 4. Get Function Details (Gemini Powered)
GET /api/function/{repo_id}?file_path={file_path}&function_name={function_name}

Response (Success):
{
  "status": "ok",
  "repo_id": "63e61aef-7bcd-4fc9-a61b-3a37024409c2",
  "file_path": "/absolute/path/to/processed_repos/uuid/src/user_service.py",
  "details": {
    "function_name": "create_user",
    "inputs": "username (str): User's username, email (str): User's email address, age (int): User's age",
    "outputs": "dict: User object containing id, username, email, age, and created_at timestamp",
    "description": "Creates a new user with validation. Validates age requirement (18+) and generates unique ID and timestamp."
  }
}

### 5. Get AI Project Summary (NEW - Comprehensive Analysis)
GET /api/project-summary/{repo_id}

Response (Success):
{
  "status": "ok",
  "repo_id": "63e61aef-7bcd-4fc9-a61b-3a37024409c2",
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
    "overview": "This is a well-structured web application with clear separation between backend and frontend components",
    "strengths": ["Clean architecture", "Good function organization", "Appropriate technology choices"],
    "recommendations": ["Add unit tests", "Consider API documentation", "Implement error logging"],
    "architecture_insights": "Project follows MVC patterns with clear component separation",
    "technology_assessment": "Modern technology stack with Python backend and JavaScript frontend"
  },
  "generated_at": "2024-01-15T10:30:45"
}

## FRONTEND PAGES STRUCTURE:

### Page 1: Upload & Architecture Overview
- File upload
- Architecture map visualization
- Basic stats (file count, function count)

### Page 2: File Browser (NEW)
- List of all files in project
- Function count per file
- Expandable file sections showing function lists

### Page 3: Function Details (NEW)
- Function name, inputs, outputs
- AI-generated description via Gemini
- Actual function code
- Back navigation to file browser

## ENVIRONMENT SETUP:
Create .env file with:
GEMINI_API_KEY=your_gemini_api_key_here

Get API key from: https://makersuite.google.com/app/apikey

## EXAMPLE FRONTEND NAVIGATION:
```javascript
// 1. Upload and analyze
const { repo_id } = await uploadAndAnalyze(zipFile);

// 2. Navigate to file browser
const filesData = await fetch(`/api/files/${repo_id}`);
// Show file list with function counts

// 3. User clicks on a function
const functionDetails = await fetch(`/api/function/${repo_id}?file_path=${filePath}&function_name=${funcName}`);
// Show detailed function page with AI description
```
"""