# 🏮 Code Lantern - Project Architecture Analyzer

> Upload your code projects and visualize their architecture instantly with AI-powered insights.

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)](https://python.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

## ✨ Features

- 🚀 **Fast Upload & Analysis** - Upload ZIP files and get instant code analysis
- 🤖 **AI-Powered Insights** - Function descriptions powered by Google Gemini AI
- 📊 **Architecture Mapping** - Visual project structure with function relationships
- 🔍 **Smart Code Parsing** - Supports Python, JavaScript, TypeScript projects
- 🌐 **Frontend Ready** - Complete REST API with CORS support
- ⚡ **Lightweight** - Optimized responses for fast frontend rendering

## 🚀 Quick Start

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/your-username/code-lantern.git
cd code-lantern/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Add your Gemini API key to .env file

# Start the server
python main.py
```

### Frontend Setup
```bash
cd ../frontend
python -m http.server 3000
# Or use any static file server
```

### API Access
- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs

## 📊 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/upload` | Upload ZIP file |
| `GET` | `/api/analyze/{repo_id}` | **Generate complete architecture JSON** |
| `GET` | `/api/files/{repo_id}` | Get file browser data |
| `GET` | `/api/function/{repo_id}` | Get AI function details |
| `GET` | `/api/project-summary/{repo_id}` | **Get comprehensive project analysis with AI insights** |

**The `/api/analyze/{repo_id}` endpoint returns the complete project architecture as JSON, including all files, functions, and their call relationships.**

**The `/api/project-summary/{repo_id}` endpoint provides detailed statistics, code health scores, and AI-powered insights about the uploaded project.**

## 🏗️ Architecture

### Backend (FastAPI)
- **Upload Service** - Handles ZIP file uploads and extraction
- **Code Analyzer** - Parses source files and extracts functions
- **Gemini AI Integration** - Generates intelligent function descriptions
- **REST API** - Clean endpoints for frontend integration

### Frontend (HTML/CSS/JS)
- **Upload Interface** - Drag & drop ZIP file upload
- **File Browser** - Navigate project structure
- **Function Details** - AI-powered insights display

## 🛠️ Tech Stack

**Backend:**
- FastAPI (Python web framework)
- Google Gemini AI (Function analysis)
- Regex-based code parsing
- UUID for unique project identification

**Frontend:**
- Vanilla HTML/CSS/JavaScript
- Responsive design
- File upload with progress
- Dynamic content rendering

## 🎯 Use Cases

- **Code Review** - Understand unfamiliar codebases quickly
- **Documentation** - Generate function descriptions automatically  
- **Architecture Analysis** - Visualize project structure and dependencies
- **Onboarding** - Help new developers understand existing projects
- **Refactoring** - Identify function relationships and dependencies

## 📝 Example Workflow

1. **Upload** a ZIP file containing your project
2. **Analyze** - Backend extracts functions and generates architecture map
3. **Browse** - Navigate files and view function lists
4. **Explore** - Click functions to see AI-powered descriptions

### Sample API Response
```json
{
  "status": "ok",
  "details": {
    "function_name": "create_user",
    "inputs": "username (str), email (str), age (int)",
    "outputs": "dict - User object with ID and metadata",
    "description": "Creates a new user with validation and unique ID generation"
  }
}
```

## 🔧 Configuration

### Environment Variables
```bash
# .env file
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your Gemini API key from: [Google AI Studio](https://makersuite.google.com/app/apikey)

### Supported File Types
- Python (`.py`)
- JavaScript (`.js`)
- TypeScript (`.ts`, `.tsx`)
- JSX (`.jsx`)

## 🚀 Deployment

### Backend (FastAPI)
```bash
# Production deployment
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
Deploy the `frontend/` directory to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) for the amazing web framework
- [Google Gemini AI](https://ai.google.dev/) for intelligent code analysis
- [Regex](https://docs.python.org/3/library/re.html) for code parsing capabilities

## 🐛 Issues & Support

If you encounter any issues or have questions:
1. Check the [API Documentation](http://localhost:8000/docs)
2. Review the [Frontend Integration Guide](FRONTEND_INTEGRATION_GUIDE.md)
3. Open an issue on GitHub

---

**Built with ❤️ for developers who want to understand code faster**

🏮 **Code Lantern** - *Illuminating your codebase, one function at a time*
