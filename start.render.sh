#!/bin/bash
set -e

echo "🚀 Starting AI Journal Editor on Render.com"

# Get port from environment (Render provides $PORT)
PORT=${PORT:-10000}

echo "📦 Port: $PORT"

# Update nginx configuration with actual port
sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/sites-available/default
sed -i "s/8000/${BACKEND_PORT:-8000}/g" /etc/nginx/sites-available/default

# Start nginx in background
echo "🌐 Starting Nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Wait a bit for nginx to start
sleep 2

# Start FastAPI backend
echo "🐍 Starting FastAPI Backend..."
cd /app/backend
uvicorn app.main:app --host 127.0.0.1 --port ${BACKEND_PORT:-8000} &
BACKEND_PID=$!

echo "✅ Services started!"
echo "   - Nginx (Frontend): http://localhost:$PORT"
echo "   - Backend API: http://localhost:${BACKEND_PORT:-8000}"

# Wait for both processes
wait $NGINX_PID $BACKEND_PID
