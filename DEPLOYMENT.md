# Deployment Guide

This guide describes how to deploy the Code Lantern application in a production-like environment using Docker.

## Changes Made for Deployment
- **Frontend**: 
  - Converted `Dockerfile` to a multi-stage build.
  - Stage 1: Builds the React/Vite app using Node.
  - Stage 2: Serves the static files using Nginx (lighter, faster).
  - Added `nginx.conf` to handle Single Page Application (SPA) routing.
- **Backend**:
  - Added `gunicorn` for a production-grade process manager.
  - Updated `Dockerfile` to run `gunicorn` with `uvicorn` workers.
  - Retained `build-essential` for compiling `tree-sitter` dependencies.
- **Docker Compose**:
  - Mapped Frontend to port `80` (standard web port).
  - Configured build arguments for the frontend.

## How to Run (Local Production Test)

1. **Configure Environment Variables**:
   Ensure `backend/.env` exists and contains necessary keys (like `GEMINI_API_KEY`, etc.).

2. **Build and Run**:
   ```bash
   docker-compose up --build -d
   ```

3. **Access**:
   - Frontend: `http://localhost` (Port 80)
   - Backend API: `http://localhost:8002`

## Production Considerations

### 1. Environment Variables
- **Frontend**: The `VITE_API_URL` is baked into the static files at build time. In `docker-compose.yml`, it is currently set to `http://localhost:8002`. 
  - **Action**: When deploying to a real server, update `VITE_API_URL` in `docker-compose.yml` to your public domain or IP (e.g., `https://api.example.com` or `/api` if using a reverse proxy).
- **Backend**: Ensure secrets in `.env` are secure and not committed to version control.

### 2. HTTPS / SSL
- This setup serves content over HTTP. For production, you should put a reverse proxy (like Nginx on the host, Traefik, or a cloud load balancer) in front of these containers to handle SSL/TLS termination.

### 3. Ports
- `docker-compose.yml` exposes backend on `8002`. You might want to remove this exposure or restrict it to `localhost` if you are using an internal network or reverse proxy.
