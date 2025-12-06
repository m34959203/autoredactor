# 🚂 Деплой на Railway.app

Пошаговая инструкция для развертывания AI-Редактора Журнала на Railway.

## 📋 Предварительные требования

1. Аккаунт на [Railway.app](https://railway.app)
2. OpenRouter API ключ для AI функций
3. GitHub репозиторий (опционально)

## 🎯 Архитектура деплоя

Railway будет запускать **3 сервиса**:

```
┌─────────────────────────────────────────┐
│           Railway Project               │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │ Backend  │  │ Frontend │  │ Redis │ │
│  │ (FastAPI)│  │ (React)  │  │       │ │
│  └──────────┘  └──────────┘  └───────┘ │
│       │             │            │      │
│       └─────────────┴────────────┘      │
│                  │                      │
│          ┌───────────────┐              │
│          │  PostgreSQL   │              │
│          │   (Plugin)    │              │
│          └───────────────┘              │
│                                         │
└─────────────────────────────────────────┘
```

## 🚀 Вариант 1: Деплой через GitHub (Рекомендуется)

### Шаг 1: Подготовка репозитория

```bash
# Убедитесь, что все изменения закоммичены
git add .
git commit -m "Add Railway deployment configuration"
git push origin main
```

### Шаг 2: Создание проекта на Railway

1. Перейдите на [railway.app](https://railway.app)
2. Нажмите **"New Project"**
3. Выберите **"Deploy from GitHub repo"**
4. Выберите ваш репозиторий `autoredactor`

### Шаг 3: Настройка сервисов

#### 3.1 Добавить PostgreSQL

1. Нажмите **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway автоматически создаст БД и добавит переменные окружения

#### 3.2 Добавить Redis

1. Нажмите **"+ New"** → **"Database"** → **"Add Redis"**
2. Railway автоматически создаст Redis instance

#### 3.3 Настроить Backend сервис

1. Нажмите **"+ New"** → **"GitHub Repo"** → выберите ваш репозиторий
2. В настройках сервиса:
   - **Name**: `backend`
   - **Root Directory**: `backend`
   - **Build Command**: оставьте пустым (Nixpacks автоматически)
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. Добавьте **переменные окружения**:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
OPENROUTER_API_KEY=sk-or-v1-ваш-ключ-здесь
AI_MODEL=deepseek/deepseek-chat
SESSION_TTL_HOURS=24
MAX_FILE_SIZE_MB=50
MAX_ARTICLES_PER_SESSION=100
UPLOAD_DIR=/app/uploads
PORT=8000
```

4. В **Settings** → **Networking**:
   - Включите **Public Networking**
   - Скопируйте публичный URL (например, `backend-production.up.railway.app`)

#### 3.4 Настроить Frontend сервис

1. Нажмите **"+ New"** → **"GitHub Repo"** → выберите тот же репозиторий
2. В настройках сервиса:
   - **Name**: `frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npx serve -s dist -l $PORT`

3. Добавьте **переменную окружения**:

```env
VITE_API_URL=https://backend-production.up.railway.app
PORT=3000
```

4. В **Settings** → **Networking**:
   - Включите **Public Networking**
   - Опционально: настройте кастомный домен

### Шаг 4: Обновить Frontend конфигурацию

Обновите `frontend/vite.config.ts` для работы с Railway:

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: parseInt(process.env.PORT || '3000'),
  }
})
```

## 🔧 Вариант 2: Деплой через Railway CLI

### Установка CLI

```bash
# macOS / Linux
curl -fsSL https://railway.app/install.sh | sh

# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex
```

### Деплой

```bash
# Логин
railway login

# Создать проект
railway init

# Добавить PostgreSQL
railway add --database postgres

# Добавить Redis
railway add --database redis

# Деплой backend
cd backend
railway up

# Деплой frontend
cd ../frontend
railway up
```

## 🌐 Вариант 3: Monorepo с одним сервисом

Если хотите запустить всё в одном контейнере:

### Создайте `Dockerfile` в корне:

```dockerfile
FROM python:3.11-slim as backend-build

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-writer \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Backend setup
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# Frontend build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Final image
FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-writer \
    nginx \
    && rm -rf /var/lib/apt/lists/*

COPY --from=backend-build /app/backend /app/backend
COPY --from=backend-build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /app/backend

# Start script
COPY <<'EOF' /start.sh
#!/bin/bash
nginx &
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
EOF

RUN chmod +x /start.sh

CMD ["/start.sh"]
```

## 🔐 Переменные окружения

Обязательные переменные для Railway:

```env
# Backend
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
OPENROUTER_API_KEY=your_openrouter_key
AI_MODEL=deepseek/deepseek-chat
PORT=${{PORT}}

# Frontend (если отдельный сервис)
VITE_API_URL=https://your-backend.up.railway.app
```

## 📊 Мониторинг

Railway предоставляет:
- **Логи** в реальном времени
- **Метрики** использования CPU/RAM
- **Deployment history**
- **Healthcheck monitoring**

## 💰 Стоимость

Railway предлагает:
- **$5 бесплатно** каждый месяц
- **Pay as you go** после исчерпания кредитов
- ~$5-20/месяц для небольших приложений

## 🐛 Troubleshooting

### Backend не запускается

```bash
# Проверьте логи
railway logs

# Убедитесь, что LibreOffice установлен
# Добавьте в nixpacks.toml:
aptPkgs = ["libreoffice", "libreoffice-writer"]
```

### Frontend не может подключиться к Backend

1. Проверьте, что `VITE_API_URL` правильно установлен
2. Убедитесь, что CORS настроен в `backend/app/main.py`
3. Проверьте, что оба сервиса имеют Public Networking

### База данных не подключается

1. Используйте Railway переменную: `${{Postgres.DATABASE_URL}}`
2. Убедитесь, что URL начинается с `postgresql+asyncpg://`

## 📝 Чеклист перед деплоем

- [ ] OpenRouter API ключ получен
- [ ] Все секреты добавлены в Railway переменные
- [ ] CORS настроен для production URL
- [ ] Frontend API URL указывает на production backend
- [ ] PostgreSQL и Redis добавлены как плагины
- [ ] Public networking включен для нужных сервисов
- [ ] Healthcheck endpoint работает (`/health`)

## 🎉 Готово!

После успешного деплоя ваше приложение будет доступно по адресам:

- **Frontend**: `https://your-frontend.up.railway.app`
- **Backend API**: `https://your-backend.up.railway.app/docs`

---

**Нужна помощь?**
- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
