#!/bin/bash
set -e

echo "Starting AI Journal Editor on Railway.app"
PORT=${PORT:-8000}
BACKEND_PORT=8001

echo "Port: $PORT (Frontend + API proxy)"
echo "Backend internal port: $BACKEND_PORT"

# ──────────────────────────────────────────────────────────────
# 1. Настраиваем Nginx — заменяем порты в конфиге
# ──────────────────────────────────────────────────────────────
sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/sites-available/default
sed -i "s/127.0.0.1:8000/127.0.0.1:$BACKEND_PORT/g" /etc/nginx/sites-available/default

echo "Testing Nginx configuration..."
nginx -t

echo "Starting Nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Даём Nginx время подняться
sleep 3

# ──────────────────────────────────────────────────────────────
# 2. Запускаем FastAPI — ИСПРАВЛЕННЫЙ ПУТЬ + правильная рабочая директория!
# ──────────────────────────────────────────────────────────────
echo "Starting FastAPI Backend на порту $BACKEND_PORT..."

# Самое важное — правильный путь к модулю и рабочая директория!
cd /app

# Правильная команда (backend.app.main:app — запускаем из /app)
exec uvicorn backend.app.main:app \
    --host 0.0.0.0 \
    --port $BACKEND_PORT \
    --workers 1 \
    --log-level info &

BACKEND_PID=$!

# Ждём немного, чтобы FastAPI успел запуститься и подключиться к БД
sleep 5

echo "Services started successfully!"
echo " - Frontend + API: http://localhost:$PORT"
echo " - Backend (internal): http://localhost:$BACKEND_PORT"
echo " - Health check: http://localhost:$PORT/health"

# ──────────────────────────────────────────────────────────────
# 3. Graceful shutdown
# ──────────────────────────────────────────────────────────────
shutdown() {
    echo "Shutting down..."
    kill $BACKEND_PID $NGINX_PID 2>/dev/null || true
    wait $BACKEND_PID $NGINX_PID 2>/dev/null || true
    echo "Shutdown complete"
    exit 0
}

trap shutdown SIGTERM SIGINT SIGQUIT

# Ждём любой из процессов (главное — не упасть)
wait -n $NGINX_PID $BACKEND_PID || true
shutdown
