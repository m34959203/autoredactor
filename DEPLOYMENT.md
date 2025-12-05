# 🚀 Deployment Guide - Journal Editor Web App

## Application Overview

This is a **working web application** for automating journal editing:
- Upload Word articles (.docx)
- Automatically sort articles (Latin → Cyrillic)
- Generate PDF with table of contents
- Download final journal PDF

## Architecture

- **Backend**: Flask API serving both API endpoints and React frontend
- **Frontend**: React + TypeScript with file upload interface
- **Single Server**: Flask serves everything on one port

## Local Development

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Install Node Dependencies & Build Frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

### 3. Run the Application

```bash
python api.py
```

The app will be available at: `http://localhost:5000`

## Railway Deployment

### Prerequisites

1. Push code to GitHub (✅ Already done!)
2. Have a Railway.app account

### Deploy Steps

1. **Go to [Railway.app](https://railway.app)**

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose: `m34959203/autoredactor`
   - Select branch: `claude/integrate-react-component-01NpecxbQmpynViL5GTBvaWe`

3. **Railway Auto-Configuration**
   Railway will automatically:
   - Detect Python + Node.js project
   - Use `nixpacks.toml` for build configuration
   - Install Python dependencies from `requirements.txt`
   - Install Node dependencies and build React app
   - Start Flask server with `python api.py`

4. **Get Your URL**
   - Railway will provide a public URL like: `https://your-app.railway.app`
   - Click on the deployment to see the URL

5. **Access Your App**
   - Open the Railway URL in your browser
   - You'll see the file upload interface
   - Upload .docx articles and build your journal!

## Configuration Files

- **`railway.toml`**: Railway deployment configuration
- **`nixpacks.toml`**: Build configuration (Python + Node)
- **`requirements.txt`**: Python dependencies
- **`api.py`**: Flask server that serves both API and frontend

## API Endpoints

- **`GET /`**: React frontend
- **`GET /api/health`**: Health check
- **`POST /api/build-journal`**: Upload files and generate journal PDF
  - Accepts: `articles[]` (required), `title_page`, `first_pages`, `end_pages` (optional)
  - Returns: PDF file for download

## How It Works

1. User uploads Word articles through React interface
2. Frontend sends files to Flask API endpoint
3. Flask uses `autoeditor.py` to:
   - Sort articles alphabetically (Latin → Cyrillic)
   - Convert DOCX to PDF
   - Generate table of contents
   - Assemble final PDF
4. User downloads generated journal PDF

## Troubleshooting

### Build fails on Railway
- Check build logs in Railway dashboard
- Verify all dependencies in `requirements.txt` and `package.json`

### App doesn't start
- Check Railway logs for Python errors
- Verify Flask dependencies are installed

### Frontend shows but API fails
- Check Flask server is running
- Verify API routes in `api.py`
- Check Railway logs for backend errors

## Cost Estimate

**Railway.com**:
- Free tier: $5 credit/month
- Estimated usage: $0-5/month for small scale

## Tech Stack

- **Backend**: Python 3.11 + Flask
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **PDF Processing**: python-docx, reportlab, pypdf
- **Deployment**: Railway.com with Nixpacks

---

**Ready to deploy!** Just follow the Railway steps above and your journal editor will be live in 5 minutes! 🚀
