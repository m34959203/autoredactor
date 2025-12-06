#!/bin/bash
set -e

echo "🚂 Starting AI Journal Editor on Railway.app"

# Get port from environment (Railway provides $PORT)
PORT=${PORT:-8000}
BACKEND_PORT=8001

echo "📦 Port: $PORT (Frontend+API)"
echo "🐍 Backend internal port: $BACKEND_PORT"

# Update nginx configuration with actual port
sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/sites-available/default
sed -i "s/127.0.0.1:8000/127.0.0.1:$BACKEND_PORT/g" /etc/nginx/sites-available/default

# Test nginx config
echo "🔍 Testing Nginx configuration..."
nginx -t

# Start nginx in background
echo "🌐 Starting Nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Wait a bit for nginx to start
sleep 2

# Start FastAPI backend
echo "🐍 Starting FastAPI Backend on port $BACKEND_PORT..."
cd /app/backend
uvicorn app.main:app --host 127.0.0.1 --port $BACKEND_PORT &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

echo "✅ Services started successfully!"
echo "   - Nginx (Frontend): http://localhost:$PORT"
echo "   - Backend API: http://localhost:$BACKEND_PORT"
echo "   - Health check: http://localhost:$PORT/health"

# Function to handle shutdown
shutdown() {
    echo "🛑 Shutting down services..."
    kill $NGINX_PID $BACKEND_PID 2>/dev/null
    wait $NGINX_PID $BACKEND_PID 2>/dev/null
    echo "✅ Shutdown complete"
    exit 0
}

# Trap signals
trap shutdown SIGTERM SIGINT

# Wait for both processes
wait $NGINX_PID $BACKEND_PID
