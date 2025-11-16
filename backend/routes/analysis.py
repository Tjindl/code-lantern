# routes/analysis.py
import os
import json
import re
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('models/gemini-2.0-flash')

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

def extract_function_code(file_content: str, function_name: str, file_type: str) -> str:
    """Extract the actual code of a specific function"""
    if file_type == 'python':
        # Find function definition and its body - more flexible pattern
        pattern = rf'def\s+{re.escape(function_name)}\s*\([^)]*\):'
        lines = file_content.split('\n')
        
        for i, line in enumerate(lines):
            if re.search(pattern, line):
                # Found function start, now find the end
                indent_level = len(line) - len(line.lstrip())
                function_lines = [line]
                
                for j in range(i + 1, len(lines)):
                    if lines[j].strip() == '':  # Empty line
                        function_lines.append(lines[j])
                        continue
                    
                    current_indent = len(lines[j]) - len(lines[j].lstrip())
                    if current_indent <= indent_level and lines[j].strip():
                        break  # Function ended
                    
                    function_lines.append(lines[j])
                
                return '\n'.join(function_lines)
    
    elif file_type in ['javascript', 'typescript']:
        # JavaScript/TypeScript function extraction - simplified and more robust
        patterns = [
            rf'function\s+{re.escape(function_name)}\s*\([^)]*\)',
            rf'const\s+{re.escape(function_name)}\s*=\s*\([^)]*\)\s*=>',
            rf'const\s+{re.escape(function_name)}\s*=\s*function\s*\([^)]*\)',
            rf'{re.escape(function_name)}\s*:\s*function\s*\([^)]*\)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, file_content, re.MULTILINE | re.DOTALL)
            if match:
                start_pos = match.start()
                
                # Find the start of the line
                line_start = file_content.rfind('\n', 0, start_pos) + 1
                
                # For arrow functions, look for => and then {
                if '=>' in match.group():
                    # Find the opening brace after =>
                    arrow_pos = file_content.find('=>', start_pos)
                    brace_pos = file_content.find('{', arrow_pos)
                    if brace_pos == -1:
                        continue
                    start_brace = brace_pos
                else:
                    # Find the opening brace after function declaration
                    brace_pos = file_content.find('{', match.end())
                    if brace_pos == -1:
                        continue
                    start_brace = brace_pos
                
                # Find matching closing brace
                brace_count = 0
                pos = start_brace
                while pos < len(file_content):
                    if file_content[pos] == '{':
                        brace_count += 1
                    elif file_content[pos] == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            return file_content[line_start:pos+1]
                    pos += 1
    
    return ""

async def generate_function_description(function_code: str, function_name: str, file_path: str) -> Dict[str, str]:
    """Generate function description using Gemini API"""
    if not os.getenv("GEMINI_API_KEY"):
        return {
            "function_name": function_name,
            "inputs": "API key not configured",
            "outputs": "API key not configured", 
            "description": "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file."
        }
    
    try:
        prompt = f"""
Analyze this function and provide a structured description:

File: {file_path}
Function Code:
```
{function_code}
```

Please provide:
1. Function Name: {function_name}
2. Inputs: What parameters does this function take? (include types if visible)
3. Outputs: What does this function return? (include type if visible)
4. Description: What does this function do? (2-3 sentences, clear and concise)

Format your response as JSON:
{{
    "function_name": "{function_name}",
    "inputs": "description of inputs/parameters",
    "outputs": "description of return value",
    "description": "clear description of what the function does"
}}
"""
        
        response = model.generate_content(prompt)
        
        # Try to parse JSON from response
        response_text = response.text
        
        # Extract JSON from response (in case there's extra text)
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_text = response_text[json_start:json_end]
            return json.loads(json_text)
        else:
            # Fallback if JSON parsing fails
            return {
                "function_name": function_name,
                "inputs": "Could not parse",
                "outputs": "Could not parse",
                "description": response_text[:200] + "..." if len(response_text) > 200 else response_text
            }
            
    except Exception as e:
        # Fallback to basic analysis if Gemini fails
        return {
            "function_name": function_name,
            "inputs": "Basic analysis: Function parameters extracted from code",
            "outputs": "Basic analysis: Return value analysis from code",
            "description": f"Function '{function_name}' in file '{file_path}'. Gemini API error: {str(e)[:100]}. Basic code analysis available."
        }

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

@router.get("/files/{repo_id}")
async def get_project_files(repo_id: str):
    """Get list of files in the project for file browser"""
    repo_path = os.path.join("processed_repos", repo_id)
    
    if not os.path.exists(repo_path):
        raise HTTPException(status_code=404, detail="Repository not found")
    
    # Read the architecture map if it exists
    json_path = os.path.join(repo_path, "architecture_map.json")
    if not os.path.exists(json_path):
        raise HTTPException(status_code=404, detail="Architecture map not found. Run analysis first.")
    
    with open(json_path, 'r') as f:
        architecture_map = json.load(f)
    
    # Transform for file browser view
    files_with_functions = []
    for file_data in architecture_map['listOfFiles']:
        file_info = {
            "filePath": file_data['filePath'],
            "functionCount": len(file_data['listOfFunctions']),
            "functions": [func['functionName'].split('-')[-1] for func in file_data['listOfFunctions']]  # Just function names
        }
        files_with_functions.append(file_info)
    
    return {
        "status": "ok",
        "repo_id": repo_id,
        "totalFiles": len(files_with_functions),
        "files": files_with_functions
    }

@router.get("/function/{repo_id}")
async def get_function_details(repo_id: str, file_path: str, function_name: str):
    """Get detailed description of a specific function using Gemini API"""
    repo_path = os.path.join("processed_repos", repo_id)
    
    if not os.path.exists(repo_path):
        raise HTTPException(status_code=404, detail="Repository not found")
    
    # Read the actual file to get function code
    full_file_path = os.path.join(repo_path, file_path)
    if not os.path.exists(full_file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        with open(full_file_path, 'r', encoding='utf-8') as f:
            file_content = f.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not read file: {str(e)}")
    
    # Determine file type
    file_ext = os.path.splitext(file_path)[1]
    if file_ext == '.py':
        file_type = 'python'
    elif file_ext in ['.js', '.ts', '.tsx', '.jsx']:
        file_type = 'javascript'
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    # Extract function code
    function_code = extract_function_code(file_content, function_name, file_type)
    
    if not function_code:
        raise HTTPException(status_code=404, detail="Function not found in file")
    
    # Generate description using Gemini
    function_description = await generate_function_description(function_code, function_name, file_path)
    
    return {
        "status": "ok",
        "repo_id": repo_id,
        "file_path": file_path,
        "details": function_description
    }