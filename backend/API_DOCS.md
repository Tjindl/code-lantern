# API Documentation for Frontend Team
"""
CODE LANTERN BACKEND API DOCUMENTATION

Base URL: http://localhost:8000

## WORKFLOW:
1. Upload ZIP file to /api/upload
2. Use returned repo_id to analyze project via /api/analyze/{repo_id}

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

Response (Error):
{
  "detail": "Only ZIP files are allowed"
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

Response (Error):
{
  "detail": "Repository not found"
}

## FRONTEND INTEGRATION NOTES:
- CORS is enabled for all origins
- All endpoints return JSON
- Error responses follow FastAPI standard format
- File upload uses FormData with 'file' field
- Architecture map follows the specified structure:
  MainThing { listOfFiles }
  File { filePath, listOfFunctions }  
  Function { functionName, calls }

## EXAMPLE FRONTEND CODE:
```javascript
// Upload file
const formData = new FormData();
formData.append('file', zipFile);
const uploadResponse = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
const { repo_id } = await uploadResponse.json();

// Analyze project  
const analysisResponse = await fetch(`/api/analyze/${repo_id}`);
const result = await analysisResponse.json();
console.log(result.architecture_map);
```
"""