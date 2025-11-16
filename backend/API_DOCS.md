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
        "filePath": "src/main.py",
        "listOfFunctions": [
          {
            "functionName": "src/main.py-hello_world",
            "calls": ["greet_user"]
          }
        ]
      }
    ]
  }
}

### 3. Get Project Files (NEW)
GET /api/files/{repo_id}

Response (Success):
{
  "status": "ok",
  "repo_id": "63e61aef-7bcd-4fc9-a61b-3a37024409c2",
  "totalFiles": 2,
  "files": [
    {
      "filePath": "src/user_service.py",
      "functionCount": 3,
      "functions": ["create_user", "validate_email", "generate_id"]
    },
    {
      "filePath": "src/utils.js", 
      "functionCount": 2,
      "functions": ["calculateTotalPrice", "formatCurrency"]
    }
  ]
}

### 4. Get Function Details (NEW - Gemini Powered)
GET /api/function/{repo_id}?file_path={file_path}&function_name={function_name}

Response (Success):
{
  "status": "ok",
  "repo_id": "63e61aef-7bcd-4fc9-a61b-3a37024409c2",
  "file_path": "src/user_service.py",
  "details": {
    "function_name": "create_user",
    "inputs": "username (str): User's username, email (str): User's email address, age (int): User's age",
    "outputs": "dict: User object containing id, username, email, age, and created_at timestamp",
    "description": "Creates a new user with validation. Validates age requirement (18+) and generates unique ID and timestamp."
  }
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