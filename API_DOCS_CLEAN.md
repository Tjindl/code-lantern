# Code Lantern API Documentation

## Endpoints

### 1. Upload Project
```
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
```
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
            "functionName": "src/main.py-function_name",
            "calls": ["other_function", "another_function"]
          }
        ]
      }
    ]
  }
}
```

### 3. Get File Browser Data
```
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
      "filePath": "src/user_service.py",
      "functionCount": 2,
      "functions": ["function1", "function2"]
    }
  ]
}
```

### 4. Get Function Details
```
GET /api/function/{repo_id}?file_path={file_path}&function_name={function_name}
```

**Response:**
```json
{
  "status": "ok",
  "repo_id": "uuid-string",
  "file_path": "src/user_service.py",
  "details": {
    "function_name": "create_user",
    "inputs": "username (str), email (str), age (int)",
    "outputs": "dict - User object with ID and metadata",
    "description": "Creates a new user with validation and unique ID generation"
  }
}
```

### 5. Get Project Summary
```
GET /api/project-summary/{repo_id}
```

**Response:**
```json
{
  "status": "ok",
  "repo_id": "uuid-string",
  "project_stats": {
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
  },
  "ai_summary": {
    "overview": "Well-structured web application with clean separation",
    "strengths": ["Clean architecture", "Good organization"],
    "recommendations": ["Add unit tests", "Implement logging"],
    "architecture_insights": "Project follows MVC patterns",
    "technology_assessment": "Modern Python/JavaScript stack"
  },
  "generated_at": "2024-01-15T10:30:45"
}
```

## Error Responses

- `404` - Repository/file/function not found
- `400` - Invalid file type or malformed request
- `500` - Server error

Example:
```json
{
  "detail": "Repository not found"
}
```