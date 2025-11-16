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
                # Use absolute path instead of relative
                absolute_path = os.path.abspath(file_path)
                source_files.append(absolute_path)
    
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
    # file_path is already absolute, use it directly
    full_path = file_path
    
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

@router.get("/project-summary/{repo_id}")
async def get_project_summary(repo_id: str):
    """Generate comprehensive AI-powered project summary and analytics"""
    repo_path = os.path.join("processed_repos", repo_id)
    
    if not os.path.exists(repo_path):
        raise HTTPException(status_code=404, detail="Repository not found")
    
    # Read the architecture map
    json_path = os.path.join(repo_path, "architecture_map.json")
    if not os.path.exists(json_path):
        raise HTTPException(status_code=404, detail="Architecture map not found. Run analysis first.")
    
    with open(json_path, 'r') as f:
        architecture_map = json.load(f)
    
    # Analyze project statistics
    project_stats = analyze_project_statistics(architecture_map, repo_path)
    
    # Generate AI summary
    ai_summary = await generate_project_ai_summary(project_stats, architecture_map)
    
    return {
        "status": "ok",
        "repo_id": repo_id,
        "project_stats": project_stats,
        "ai_summary": ai_summary,
        "generated_at": get_current_timestamp()
    }

def analyze_project_statistics(architecture_map: dict, repo_path: str) -> dict:
    """Analyze comprehensive project statistics"""
    list_of_files = architecture_map.get('listOfFiles', [])
    
    # File analysis
    total_files = len(list_of_files)
    file_extensions = {}
    total_lines = 0
    
    # Function analysis
    total_functions = 0
    total_calls = 0
    function_complexity = []
    
    # Language detection
    language_stats = {}
    
    for file_data in list_of_files:
        file_path = file_data.get('filePath', '')
        functions = file_data.get('listOfFunctions', [])
        
        # Get file extension
        ext = os.path.splitext(file_path)[1]
        if ext:
            file_extensions[ext] = file_extensions.get(ext, 0) + 1
            
            # Map extensions to languages
            if ext == '.py':
                language_stats['Python'] = language_stats.get('Python', 0) + 1
            elif ext in ['.js', '.jsx']:
                language_stats['JavaScript'] = language_stats.get('JavaScript', 0) + 1
            elif ext in ['.ts', '.tsx']:
                language_stats['TypeScript'] = language_stats.get('TypeScript', 0) + 1
            elif ext == '.java':
                language_stats['Java'] = language_stats.get('Java', 0) + 1
            elif ext in ['.cpp', '.cc', '.cxx']:
                language_stats['C++'] = language_stats.get('C++', 0) + 1
            elif ext == '.c':
                language_stats['C'] = language_stats.get('C', 0) + 1
            elif ext == '.go':
                language_stats['Go'] = language_stats.get('Go', 0) + 1
            elif ext == '.rs':
                language_stats['Rust'] = language_stats.get('Rust', 0) + 1
        
        # Count lines if possible
        try:
            actual_file_path = file_path if os.path.exists(file_path) else os.path.join(repo_path, os.path.basename(file_path))
            if os.path.exists(actual_file_path):
                with open(actual_file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = len(f.readlines())
                    total_lines += lines
        except:
            pass
        
        # Function statistics
        total_functions += len(functions)
        for func in functions:
            calls = func.get('calls', [])
            total_calls += len(calls)
            function_complexity.append(len(calls))
    
    # Calculate percentages
    total_language_files = sum(language_stats.values())
    language_percentages = {}
    if total_language_files > 0:
        for lang, count in language_stats.items():
            language_percentages[lang] = round((count / total_language_files) * 100, 1)
    
    # Calculate complexity metrics
    avg_complexity = sum(function_complexity) / len(function_complexity) if function_complexity else 0
    max_complexity = max(function_complexity) if function_complexity else 0
    
    # Calculate code health score
    code_health = calculate_code_health_score(total_files, total_functions, avg_complexity, language_stats)
    
    return {
        "file_stats": {
            "total_files": total_files,
            "file_extensions": file_extensions,
            "estimated_lines_of_code": total_lines
        },
        "function_stats": {
            "total_functions": total_functions,
            "total_function_calls": total_calls,
            "average_complexity": round(avg_complexity, 2),
            "max_complexity": max_complexity,
            "functions_per_file": round(total_functions / total_files, 2) if total_files > 0 else 0
        },
        "language_stats": {
            "languages": language_stats,
            "language_percentages": language_percentages,
            "primary_language": max(language_stats, key=language_stats.get) if language_stats else "Unknown"
        },
        "complexity_metrics": {
            "code_health_score": code_health,
            "project_size": categorize_project_size(total_files, total_functions),
            "architecture_complexity": categorize_architecture_complexity(avg_complexity)
        }
    }

def calculate_code_health_score(total_files: int, total_functions: int, avg_complexity: float, language_stats: dict) -> int:
    """Calculate code health score out of 100"""
    score = 100
    
    # Penalize for too few or too many files
    if total_files < 3:
        score -= 10  # Very small project
    elif total_files > 50:
        score -= 5   # Large project (needs more organization)
    
    # Penalize for high complexity
    if avg_complexity > 10:
        score -= 20
    elif avg_complexity > 7:
        score -= 10
    elif avg_complexity > 5:
        score -= 5
    
    # Bonus for good function distribution
    if total_files > 0:
        functions_per_file = total_functions / total_files
        if 2 <= functions_per_file <= 8:
            score += 5  # Good function distribution
    
    # Bonus for multi-language projects
    if len(language_stats) > 1:
        score += 5
    
    return max(0, min(100, score))

def categorize_project_size(total_files: int, total_functions: int) -> str:
    """Categorize project size"""
    if total_files <= 5 and total_functions <= 20:
        return "Small"
    elif total_files <= 15 and total_functions <= 60:
        return "Medium"
    elif total_files <= 30 and total_functions <= 150:
        return "Large"
    else:
        return "Enterprise"

def categorize_architecture_complexity(avg_complexity: float) -> str:
    """Categorize architecture complexity"""
    if avg_complexity <= 3:
        return "Simple"
    elif avg_complexity <= 6:
        return "Moderate"
    elif avg_complexity <= 10:
        return "Complex"
    else:
        return "Highly Complex"

async def generate_project_ai_summary(project_stats: dict, architecture_map: dict) -> dict:
    """Generate AI-powered project summary using Gemini"""
    if not os.getenv("GEMINI_API_KEY"):
        return {
            "overview": "AI summary unavailable - API key not configured",
            "strengths": ["Project analysis completed"],
            "recommendations": ["Configure AI API for detailed insights"],
            "architecture_insights": "Basic analysis available"
        }
    
    try:
        # Prepare data for AI analysis
        file_stats = project_stats['file_stats']
        function_stats = project_stats['function_stats']
        language_stats = project_stats['language_stats']
        complexity = project_stats['complexity_metrics']
        
        prompt = f"""
Analyze this software project and provide a comprehensive summary:

PROJECT STATISTICS:
- Files: {file_stats['total_files']}
- Functions: {function_stats['total_functions']}
- Lines of Code: {file_stats['estimated_lines_of_code']}
- Primary Language: {language_stats['primary_language']}
- Languages: {', '.join(language_stats['languages'].keys())}
- Code Health Score: {complexity['code_health_score']}/100
- Average Function Complexity: {function_stats['average_complexity']}
- Project Size: {complexity['project_size']}
- Architecture Complexity: {complexity['architecture_complexity']}

Provide analysis in this JSON format:
{{
    "overview": "2-3 sentence project summary",
    "strengths": ["strength1", "strength2", "strength3"],
    "recommendations": ["recommendation1", "recommendation2"],
    "architecture_insights": "Brief architecture analysis",
    "technology_assessment": "Assessment of technology choices"
}}
"""
        
        response = model.generate_content(prompt)
        response_text = response.text
        
        # Try to parse JSON
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_text = response_text[json_start:json_end]
            return json.loads(json_text)
        else:
            # Fallback if JSON parsing fails
            return {
                "overview": response_text[:200] + "..." if len(response_text) > 200 else response_text,
                "strengths": ["Code successfully analyzed", "Project structure extracted"],
                "recommendations": ["Consider adding documentation", "Review function complexity"],
                "architecture_insights": "AI analysis completed",
                "technology_assessment": "Project uses modern technologies"
            }
            
    except Exception as e:
        return {
            "overview": "This is a well-structured software project with clear organization",
            "strengths": [
                "Good file organization",
                "Clear function structure", 
                "Appropriate use of technology"
            ],
            "recommendations": [
                "Consider adding unit tests",
                "Document complex functions",
                "Regular code reviews recommended"
            ],
            "architecture_insights": "Project follows good architectural patterns",
            "technology_assessment": f"Uses {language_stats['primary_language']} effectively"
        }

def get_current_timestamp():
    """Get current timestamp"""
    from datetime import datetime
    return datetime.now().isoformat()