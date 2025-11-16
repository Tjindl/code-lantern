# analyzer.py
# Code Lantern – Architecture Diagram Analyzer (MVP)
# ---------------------------------------------------
# Extracts:
# - files in repo
# - imports (JS/Python)
# - function names
# And returns metadata for architecture graph.

import os
import json
from tree_sitter import Parser
from tree_sitter_javascript import JAVASCRIPT_LANGUAGE
from tree_sitter_python import PYTHON_LANGUAGE

# Set up parser globally
parser = Parser()


# -------------------------------
# Utils
# -------------------------------

def read_file(path: str) -> str:
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except:
        return ""


def detect_language(path: str):
    ext = os.path.splitext(path)[1].lower()
    if ext in [".js", ".jsx", ".ts", ".tsx"]:
        return "js"
    if ext in [".py"]:
        return "py"
    return None


# -------------------------------
# JS Import Extractor
# -------------------------------
def extract_js_imports(tree, code):
    imports = []

    def walk(node):
        # import x from '...'
        if node.type == "import_statement":
            for child in node.children:
                if child.type == "string":
                    # remove quotes
                    module = code[child.start_byte+1 : child.end_byte-1]
                    imports.append(module)

        # require("...") support?
        if node.type == "call_expression":
            # we check for require("module")
            if len(node.children) >= 2 and node.children[0].type == "identifier":
                fn = code[node.children[0].start_byte:node.children[0].end_byte]
                if fn == "require":
                    arg = node.children[1]
                    if arg.type == "arguments" and len(arg.children) >= 2:
                        mod_node = arg.children[1]
                        if mod_node.type == "string":
                            module = code[mod_node.start_byte+1 : mod_node.end_byte-1]
                            imports.append(module)

        for c in node.children:
            walk(c)

    walk(tree.root_node)
    return imports


# -------------------------------
# Python Import Extractor
# -------------------------------
def extract_py_imports(tree, code):
    imports = []

    def walk(node):
        # import module
        if node.type == "import_statement":
            # child[1] is module name
            for child in node.children:
                if child.type == "dotted_name" or child.type == "identifier":
                    module = code[child.start_byte : child.end_byte]
                    imports.append(module)

        # from module import x
        if node.type == "import_from_statement":
            # module = children[1]
            if len(node.children) > 1:
                module = code[node.children[1].start_byte : node.children[1].end_byte]
                imports.append(module)

        for c in node.children:
            walk(c)

    walk(tree.root_node)
    return imports


# -------------------------------
# Function Extractor (JS + Python)
# -------------------------------
def extract_functions(tree, code):
    functions = []

    def walk(node):
        # JS: function_declaration
        if node.type == "function_declaration":
            for child in node.children:
                if child.type == "identifier":
                    fn = code[child.start_byte:child.end_byte]
                    functions.append(fn)

        # Python: function_definition
        if node.type == "function_definition":
            for child in node.children:
                if child.type == "identifier":
                    fn = code[child.start_byte:child.end_byte]
                    functions.append(fn)

        for c in node.children:
            walk(c)

    walk(tree.root_node)
    return functions


# -------------------------------
# Single File Analysis
# -------------------------------
def analyze_file(path: str):
    lang = detect_language(path)
    if not lang:
        return None

    code = read_file(path)
    if not code.strip():
        return None

    # Set language for parser
    if lang == "js":
        parser.set_language(JAVASCRIPT_LANGUAGE)
    elif lang == "py":
        parser.set_language(PYTHON_LANGUAGE)

    tree = parser.parse(bytes(code, "utf-8"))

    # Extract imports
    if lang == "js":
        imports = extract_js_imports(tree, code)
    else:
        imports = extract_py_imports(tree, code)

    # Extract functions
    functions = extract_functions(tree, code)

    return {
        "file": path,
        "imports": imports,
        "functions": functions
    }


# -------------------------------
# Analyze whole repository
# -------------------------------
def analyze_repo(repo_path: str):
    results = {}
    valid_exts = [".js", ".jsx", ".ts", ".tsx", ".py"]

    # Discover files
    file_paths = []
    for root, _, files in os.walk(repo_path):
        for f in files:
            if os.path.splitext(f)[1] in valid_exts:
                file_paths.append(os.path.join(root, f))

    # Analyze each file
    for f in file_paths:
        meta = analyze_file(f)
        if meta:
            results[f] = meta

    # Build architecture edges (file → file)
    edges = []
    for file, meta in results.items():
        for imp in meta["imports"]:
            # Only resolve relative imports (./ or ../)
            if imp.startswith("."):
                # Convert relative import to file path
                base_dir = os.path.dirname(file)
                possible = os.path.normpath(os.path.join(base_dir, imp))
                # Try extensions
                for ext in valid_exts:
                    if os.path.exists(possible + ext):
                        edges.append({"source": file, "target": possible + ext})

    # Format nodes
    nodes = [{"id": f} for f in results.keys()]

    return {
        "nodes": nodes,
        "edges": edges,
        "metadata": results
    }


# -------------------------------
# Local testing
# -------------------------------
if __name__ == "__main__":
    import sys
    repo = sys.argv[1]
    output = analyze_repo(repo)
    print(json.dumps(output, indent=2))
