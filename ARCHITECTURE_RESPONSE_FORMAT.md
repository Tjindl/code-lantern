# 🏗️ Architecture Response Format

## Main Endpoint: `GET /api/analyze/{repo_id}`

This endpoint returns the complete project architecture as JSON. Here's the exact format:

### Complete Response Structure:
```json
{
  "status": "ok",
  "repo_id": "uuid-string",
  "files_analyzed": 5,
  "json_path": "processed_repos/uuid-string/architecture_map.json",
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

### Real Example Response:
```json
{
  "status": "ok",
  "repo_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "files_analyzed": 4,
  "json_path": "processed_repos/a1b2c3d4-e5f6-7890-abcd-ef1234567890/architecture_map.json",
  "architecture_map": {
    "listOfFiles": [
      {
        "filePath": "src/main.py",
        "listOfFunctions": [
          {
            "functionName": "src/main.py-main",
            "calls": ["load_configuration", "initialize_app", "start_server"]
          },
          {
            "functionName": "src/main.py-load_configuration", 
            "calls": []
          },
          {
            "functionName": "src/main.py-initialize_app",
            "calls": ["setup_routes", "configure_middleware"]
          }
        ]
      },
      {
        "filePath": "services/auth.py",
        "listOfFunctions": [
          {
            "functionName": "services/auth.py-authenticate_user",
            "calls": ["find_user_by_username", "verify_password", "generate_session_token"]
          },
          {
            "functionName": "services/auth.py-find_user_by_username",
            "calls": ["database_query"]
          },
          {
            "functionName": "services/auth.py-verify_password",
            "calls": []
          }
        ]
      },
      {
        "filePath": "utils/helpers.js",
        "listOfFunctions": [
          {
            "functionName": "utils/helpers.js-validateEmail",
            "calls": []
          },
          {
            "functionName": "utils/helpers.js-formatCurrency",
            "calls": []
          },
          {
            "functionName": "utils/helpers.js-calculateTotal",
            "calls": []
          },
          {
            "functionName": "utils/helpers.js-fetchUserData",
            "calls": ["processUserData"]
          }
        ]
      }
    ]
  }
}
```

## Key Components Explained:

### 1. Top Level Properties:
- **status**: Always "ok" for successful responses
- **repo_id**: Unique identifier for the uploaded project
- **files_analyzed**: Number of source code files found and analyzed
- **json_path**: Local path where the JSON is saved on server
- **architecture_map**: The main architecture data structure

### 2. Architecture Map Structure:
- **listOfFiles**: Array containing all analyzed files
  
### 3. File Object Structure:
- **filePath**: Project-relative path (e.g., "src/main.py", "utils/helpers.js")
- **listOfFunctions**: Array of all functions found in this file

### 4. Function Object Structure:
- **functionName**: Unique name in format `{filePath}-{functionName}` 
  - Example: "src/main.py-load_configuration"
  - Example: "services/auth.py-authenticate_user"
- **calls**: Array of function names that this function calls
  - Contains just the function names (not the full unique names)
  - Example: ["load_configuration", "initialize_app"]

## Function Name Format:

The `functionName` uses this pattern: `{filePath}-{actualFunctionName}`

**Examples:**
- File: `src/main.py`, Function: `main()` → `"src/main.py-main"`
- File: `services/auth.py`, Function: `authenticate_user()` → `"services/auth.py-authenticate_user"`
- File: `utils/helpers.js`, Function: `validateEmail()` → `"utils/helpers.js-validateEmail"`

## Function Calls Format:

The `calls` array contains the actual function names being called (without file path prefix):

```json
{
  "functionName": "main.py-initialize_app",
  "calls": ["setup_routes", "configure_middleware"]
}
```

This means `initialize_app()` calls two functions: `setup_routes()` and `configure_middleware()`

## How to Use This Data:

### 1. Get All Files:
```javascript
const files = response.architecture_map.listOfFiles;
files.forEach(file => {
    console.log(`File: ${file.filePath}`);
    console.log(`Functions: ${file.listOfFunctions.length}`);
});
```

### 2. Get All Functions:
```javascript
const allFunctions = [];
response.architecture_map.listOfFiles.forEach(file => {
    file.listOfFunctions.forEach(func => {
        allFunctions.push({
            file: file.filePath,
            name: func.functionName,
            calls: func.calls
        });
    });
});
```

### 3. Build Dependency Graph:
```javascript
const dependencies = {};
response.architecture_map.listOfFiles.forEach(file => {
    file.listOfFunctions.forEach(func => {
        dependencies[func.functionName] = func.calls;
    });
});
```

### 4. Count Statistics:
```javascript
const totalFiles = response.architecture_map.listOfFiles.length;
const totalFunctions = response.architecture_map.listOfFiles.reduce(
    (sum, file) => sum + file.listOfFunctions.length, 0
);
const totalCalls = response.architecture_map.listOfFiles.reduce(
    (sum, file) => sum + file.listOfFunctions.reduce(
        (fileSum, func) => fileSum + func.calls.length, 0
    ), 0
);
```

## Frontend Integration:

The frontend should call `/api/analyze/{repo_id}` and use the `architecture_map` object to:

1. **Display file structure** with function counts
2. **Show function relationships** and dependencies  
3. **Create visual graphs** of function calls
4. **Generate statistics** about project complexity
5. **Enable navigation** from files to individual functions

This is the complete architecture data structure that powers the entire Code Lantern analysis! 🏗️