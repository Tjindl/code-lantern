# routes/analysis.py
import os
import json
import re
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException

router = APIRouter()

# Supported file extensions for analysis
SUPPORTED_EXTENSIONS = {
    '.py': 'python',
    '.js': 'javascript', 
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.jsx': 'javascript'
}

def find_source_files(repo_path: str) -> List[str]:
    """Find all source code files in the repository"""
    source_files = []
    
    for root, dirs, files in os.walk(repo_path):
        # Skip common ignore directories
        dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__', '.vscode', 'dist', 'build']]
        
        for file in files:
            if any(file.endswith(ext) for ext in SUPPORTED_EXTENSIONS.keys()):
                file_path = os.path.join(root, file)
                # Make path relative to repo root
                relative_path = os.path.relpath(file_path, repo_path)
                source_files.append(relative_path)
    
    return source_files

def extract_functions_python(file_content: str, file_path: str) -> List[Dict[str, Any]]:
    """Extract function definitions and calls from Python files"""
    functions = []
    
    # Find function definitions
    function_pattern = r'^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\('
    for match in re.finditer(function_pattern, file_content, re.MULTILINE):
        func_name = match.group(1)
        unique_name = f"{file_path}-{func_name}"
        
        # Find function calls in the file (basic pattern)
        call_pattern = r'([a-zA-Z_][a-zA-Z0-9_]*)\s*\('
        calls = []
        for call_match in re.finditer(call_pattern, file_content):
            called_func = call_match.group(1)
            if called_func != func_name and not called_func in ['print', 'len', 'str', 'int', 'list', 'dict']:
                calls.append(called_func)
        
        functions.append({
            "functionName": unique_name,
            "calls": list(set(calls))  # Remove duplicates
        })
    
    return functions

def extract_functions_javascript(file_content: str, file_path: str) -> List[Dict[str, Any]]:
    """Extract function definitions and calls from JavaScript/TypeScript files"""
    functions = []
    
    # Find function definitions (function declarations, arrow functions, methods)
    patterns = [
        r'function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(',  # function declarations
        r'const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\(',  # const func = (
        r'([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*function\s*\(',  # object methods
        r'([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*=>', # arrow functions
    ]
    
    for pattern in patterns:
        for match in re.finditer(pattern, file_content, re.MULTILINE):
            func_name = match.group(1)
            unique_name = f"{file_path}-{func_name}"
            
            # Find function calls
            call_pattern = r'([a-zA-Z_][a-zA-Z0-9_]*)\s*\('
            calls = []
            for call_match in re.finditer(call_pattern, file_content):
                called_func = call_match.group(1)
                if called_func != func_name and not called_func in ['console', 'require', 'import', 'export']:
                    calls.append(called_func)
            
            functions.append({
                "functionName": unique_name,
                "calls": list(set(calls))
            })
    
    return functions

def analyze_file(file_path: str, repo_path: str) -> Dict[str, Any]:
    """Analyze a single file and extract function information"""
    full_path = os.path.join(repo_path, file_path)
    
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return {"filePath": file_path, "listOfFunctions": []}
    
    # Determine file type and extract functions
    file_ext = os.path.splitext(file_path)[1]
    
    if file_ext == '.py':
        functions = extract_functions_python(content, file_path)
    elif file_ext in ['.js', '.ts', '.tsx', '.jsx']:
        functions = extract_functions_javascript(content, file_path)
    else:
        functions = []
    
    return {
        "filePath": file_path,
        "listOfFunctions": functions
    }

@router.get("/analyze/{repo_id}")
async def analyze_project(repo_id: str):
    """Analyze uploaded project and generate architecture map"""
    
    # Find the repo directory
    repo_path = os.path.join("processed_repos", repo_id)
    
    if not os.path.exists(repo_path):
        raise HTTPException(status_code=404, detail="Repository not found")
    
    # Find all source files
    source_files = find_source_files(repo_path)
    
    if not source_files:
        raise HTTPException(status_code=404, detail="No source files found")
    
    # Analyze each file
    analyzed_files = []
    for file_path in source_files:
        file_analysis = analyze_file(file_path, repo_path)
        analyzed_files.append(file_analysis)
    
    # Create the main architecture map
    architecture_map = {
        "listOfFiles": analyzed_files
    }
    
    # Save to JSON file
    json_path = os.path.join(repo_path, "architecture_map.json")
    with open(json_path, 'w') as f:
        json.dump(architecture_map, f, indent=2)
    
    return {
        "status": "ok",
        "repo_id": repo_id,
        "files_analyzed": len(source_files),
        "json_path": json_path,
        "architecture_map": architecture_map
    }