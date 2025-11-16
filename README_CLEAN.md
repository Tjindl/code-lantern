# 🏮 Code Lantern - AI-Powered Project Architecture Analyzer

> Upload your code projects and visualize their architecture instantly with AI-powered insights.

## ✨ Features

- 🚀 **Fast Upload & Analysis** - Upload ZIP files and get instant code analysis
- 🤖 **AI-Powered Insights** - Function descriptions powered by Google Gemini AI
- 📊 **Architecture Mapping** - Complete project structure with function relationships
- 🔍 **Smart Code Parsing** - Supports Python, JavaScript, TypeScript projects
- 🌐 **Frontend Ready** - Complete REST API with CORS support
- ⚡ **Lightweight** - Optimized responses for fast frontend rendering

## 📊 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/upload` | Upload ZIP file |
| `GET` | `/api/analyze/{repo_id}` | Generate architecture JSON with function relationships |
| `GET` | `/api/files/{repo_id}` | Get file browser data |
| `GET` | `/api/function/{repo_id}` | Get AI function details |
| `GET` | `/api/project-summary/{repo_id}` | Get comprehensive project analytics with AI insights |

## 🚀 Quick Start

### Backend Setup
```bash
git clone https://github.com/your-username/code-lantern.git
cd code-lantern/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Add your Gemini API key to .env

python main.py  # Server runs on http://localhost:8000
```

### Get Gemini API Key
Get your API key from: [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🏗️ Tech Stack

- **FastAPI** (Python web framework)
- **Google Gemini AI** (Function analysis)
- **Regex-based parsing** (Multi-language support)
- **JSON architecture maps** (Function relationships)

## 📝 Documentation

- **API Documentation**: http://localhost:8000/docs
- **Frontend Integration**: `FRONTEND_INTEGRATION_GUIDE.md`
- **Quick Reference**: `FRONTEND_CHEAT_SHEET.md`

## 🔧 Supported Languages

- Python (`.py`)
- JavaScript (`.js`, `.jsx`)
- TypeScript (`.ts`, `.tsx`)

## 📄 License

MIT License - see LICENSE file for details.

## 🛠️ Development

```bash
# Run tests
python test_all_endpoints.py

# Test project summary
python test_project_summary.py
```