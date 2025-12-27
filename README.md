# 🏮 Code Lantern - Project Architecture Analyzer

> **Illuminate your codebase.** Upload any project and instantly visualize its architecture, dependencies, and code quality with AI-powered insights.

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/Groq-f55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)

## ✨ Features

- **🚀 Instant Analysis** - Upload a ZIP or connect a GitHub repository.
- **🏗️ Interactive Architecture Maps** - Visual tree diagrams of your file structure.
- **🔗 Dependency Graphs** - Track file and function-level dependencies visually.
- **🤖 Multi-LLM AI Insights** - Powered by **Groq** (Llama 3), **Gemini**, and **Cohere** with automatic fallback.
- **📊 Complexity Heatmaps** - Identify technical debt and complex hotspots instantly.
- **⚡ Rate Limiting & Caching** - Smart resource management to keep costs low (or free).
- **🎨 Premium UI** - Glassmorphism design, smooth animations, and responsive layout.

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/Tjindl/code-lantern.git
cd code-lantern/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Add API keys (GROQ_API_KEY, GEMINI_API_KEY, etc.) to .env

# Start the server
python main.py
```

### 2. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit **http://localhost:5173** to start analyzing!

## 🔧 Configuration

Create a `.env` file in the `backend/` directory:

```env
# Primary Provider (Ultrafast)
GROQ_API_KEY=your_groq_key

# Fallback Provider 1 (Reliable)
GEMINI_API_KEY=your_gemini_key

# Fallback Provider 2 (Backup)
COHERE_API_KEY=your_cohere_key

# GitHub Integration (Optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8000/github/callback
```

## 🏗️ Architecture

### Backend
- **FastAPI**: High-performance async API.
- **Analysis Engine**: Regex & AST parsing for 6+ languages (Python, JS, TS, Java, C++, Rust).
- **Multi-LLM Provider**: Robust abstraction layer handling failovers between AI providers.
- **Rate Limiter**: In-memory tracking to prevent abuse and manage API quotas.

### Frontend
- **React + Vite**: Blazing fast SPA experience.
- **Cytoscape.js**: Powerful graph visualization for dependencies.
- **Tailwind CSS**: Modern, utility-first styling.
- **Framer Motion**: Smooth entry and exit animations.

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for developers who love clean code.**
