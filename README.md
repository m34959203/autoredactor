# 🤖 AI-Редактор Журнала

Веб-приложение на базе искусственного интеллекта для автоматизации сборки научного/профессионального журнала.

## ✨ Возможности

- 📁 **Загрузка статей** - поддержка .docx файлов с drag & drop
- 🤖 **AI извлечение метаданных** - автоматическое определение названия и автора
- 🔤 **Умная сортировка** - латиница (A-Z) → кириллица (А-Я)
- 📄 **PDF генерация** - автоматическая сборка журнала с содержанием
- ✏️ **Ручное редактирование** - корректировка метаданных статей
- 📚 **Архив выпусков** - постоянное хранение и просмотр PDF
- 🎨 **Настройки** - отступы, формат страницы, год/месяц выпуска

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend                               │
│  React 18 + TypeScript + Tailwind CSS                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend                                │
│  FastAPI (Python 3.11+)                                     │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
┌───────────────────┐ ┌───────────┐ ┌───────────────┐
│   AI Service      │ │ PDF Gen   │ │  PostgreSQL   │
│   (OpenRouter)    │ │ LibreOffice│ │  Database    │
│   DeepSeek        │ │ ReportLab │ │               │
└───────────────────┘ └───────────┘ └───────────────┘
```

## 🚀 Быстрый старт

### Требования

- Docker & Docker Compose
- OpenRouter API ключ (для AI функций)

### Установка

1. **Клонировать репозиторий**

```bash
git clone <repository-url>
cd autoredactor
```

2. **Создать .env файл**

```bash
# В корне проекта
cat > .env << EOF
OPENROUTER_API_KEY=your_openrouter_api_key_here
AI_MODEL=deepseek/deepseek-chat
EOF
```

3. **Запустить приложение**

```bash
docker-compose up --build
```

4. **Открыть в браузере**

```
http://localhost
```

Backend API доступен по адресу: `http://localhost:8000/docs`

## 🚂 Деплой на Railway.app

**Быстрый деплой в production за 5 минут!**

### Метод 1: Через Web UI (рекомендуется)

1. Перейдите на [railway.app](https://railway.app) и создайте новый проект
2. Подключите GitHub репозиторий
3. Добавьте PostgreSQL и Redis через `+ New → Database`
4. Создайте два сервиса: `backend` и `frontend`
5. Настройте переменные окружения (см. `.env.example`)

**📖 Подробная инструкция**: см. [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)
**⚡ Быстрый старт**: см. [QUICK_START_RAILWAY.md](./QUICK_START_RAILWAY.md)

### Ключевые переменные для Railway:

**Backend:**
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
OPENROUTER_API_KEY=your-openrouter-key
AI_MODEL=deepseek/deepseek-chat
```

**Frontend:**
```env
VITE_API_URL=https://your-backend.up.railway.app
```

### Стоимость
- $5/месяц бесплатно
- Затем ~$5-15/месяц для небольших проектов

---

## 🎨 Деплой на Render.com (Рекомендуется для Monolith)

**Единый сервис для фронтенда и бекенда!**

### Быстрый старт через Blueprint:

1. Перейдите на [render.com](https://render.com)
2. **New +** → **Blueprint**
3. Подключите GitHub репозиторий
4. Render автоматически развернет всё из `render.yaml`
5. Добавьте только `OPENROUTER_API_KEY` в переменные окружения

**📖 Подробная инструкция**: см. [RENDER_DEPLOY.md](./RENDER_DEPLOY.md)
**⚡ Быстрый старт**: см. [QUICK_START_RENDER.md](./QUICK_START_RENDER.md)

### Преимущества Render:

- 💰 **Дешевле** - один сервис вместо двух
- 🚀 **Проще** - автоматический деплой из `render.yaml`
- 🔧 **Unified** - фронтенд и бекенд в одном контейнере
- 📦 **Free tier** - бесплатно первые 90 дней

### Ключевые файлы:

- `render.yaml` - Blueprint конфигурация
- `Dockerfile.render` - Unified Dockerfile
- `start.render.sh` - Startup script
- `nginx.render.conf` - Nginx конфигурация

### Стоимость:
- Бесплатно первые 90 дней
- Затем ~$12-19/месяц

---

## 📦 Локальная разработка

### Backend

```bash
cd backend

# Создать виртуальное окружение
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Установить зависимости
pip install -r requirements.txt

# Создать .env файл
cp .env.example .env
# Отредактировать .env

# Запустить сервер
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Установить зависимости
npm install

# Запустить dev сервер
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:5173`

## 🔧 Конфигурация

### Backend переменные окружения

```env
# База данных
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/aieditor

# Redis (для фоновых задач)
REDIS_URL=redis://localhost:6379/0

# AI API
OPENROUTER_API_KEY=your_key_here
AI_MODEL=deepseek/deepseek-chat

# Настройки приложения
SESSION_TTL_HOURS=24
MAX_FILE_SIZE_MB=50
MAX_ARTICLES_PER_SESSION=100
UPLOAD_DIR=./uploads
```

## 📖 Использование

### 1. Загрузка статей

- Перетащите .docx файлы в область загрузки или нажмите для выбора
- AI автоматически извлечет название и автора
- Проверьте и отредактируйте метаданные при необходимости

### 2. Сортировка

- Нажмите кнопку "Сортировать A→Я"
- Статьи будут отсортированы: латиница (A-Z) → кириллица (А-Я)

### 3. Настройка журнала

- **Отступы перед статьёй**: количество пустых страниц (по умолчанию 4)
- **Год и месяц**: для архивирования выпуска
- Дополнительные настройки: формат страницы, поля

### 4. Генерация PDF

- Нажмите "Сгенерировать журнал"
- Дождитесь завершения обработки
- PDF автоматически откроется для скачивания

### 5. Архив

- Перейдите на страницу "Архив"
- Просматривайте выпуски по годам
- Открывайте PDF в браузере или скачивайте

## 🎯 Ключевые принципы AI

> **AI НЕ ИЗМЕНЯЕТ СОДЕРЖИМОЕ СТАТЕЙ**

AI выполняет только:
- Извлечение метаданных (название, автор)
- Определение языка (латиница/кириллица)
- Анализ для помощи редактору

**Тексты статей публикуются БЕЗ ИЗМЕНЕНИЙ**

## 📁 Структура проекта

```
autoredactor/
├── backend/
│   ├── app/
│   │   ├── api/routes/      # API endpoints
│   │   ├── services/        # Бизнес-логика
│   │   ├── models/          # Pydantic схемы
│   │   ├── db/              # База данных
│   │   └── main.py          # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   ├── pages/           # Страницы
│   │   ├── api/             # API клиент
│   │   ├── stores/          # Zustand stores
│   │   └── types/           # TypeScript типы
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## 🔌 API Endpoints

### Загрузка

- `POST /api/upload/article` - загрузить статью (.docx)
- `POST /api/upload/template` - загрузить шаблон (титул, вступление, заключение)

### Статьи

- `GET /api/articles/` - список статей
- `PATCH /api/articles/{id}` - обновить статью
- `DELETE /api/articles/{id}` - удалить статью
- `POST /api/articles/sort` - сортировать статьи

### Генерация

- `POST /api/generate/` - запустить генерацию
- `GET /api/generate/{task_id}/status` - статус генерации
- `GET /api/generate/{task_id}/download` - скачать PDF

### Архив

- `GET /api/archive/` - список выпусков
- `GET /api/archive/years` - список годов
- `POST /api/archive/` - сохранить в архив
- `GET /api/archive/{id}/view` - просмотр PDF
- `GET /api/archive/{id}/download` - скачать PDF

Полная документация API: `http://localhost:8000/docs`

## 🛠️ Технологии

**Backend:**
- FastAPI - современный Python веб-фреймворк
- SQLAlchemy - ORM для работы с БД
- PostgreSQL - база данных
- python-docx - парсинг Word файлов
- ReportLab - генерация PDF
- LibreOffice - конвертация DOCX → PDF
- OpenRouter - AI API

**Frontend:**
- React 18 - UI библиотека
- TypeScript - типизация
- Tailwind CSS - стилизация
- Zustand - управление состоянием
- React Router - маршрутизация
- Axios - HTTP клиент

## 🐛 Отладка

### Логи контейнеров

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Доступ к базе данных

```bash
docker-compose exec db psql -U postgres -d aieditor
```

### Перезапуск сервисов

```bash
docker-compose restart backend
docker-compose restart frontend
```

## 📝 Roadmap

- [ ] AI-чат ассистент редактора
- [ ] Поддержка PDF шаблонов
- [ ] Экспорт в различные форматы
- [ ] Предпросмотр структуры журнала
- [ ] Drag & drop сортировка статей
- [ ] Пакетная загрузка статей
- [ ] Поиск по архиву
- [ ] Метрики и аналитика

## 📄 Лицензия

MIT License

## 👥 Авторы

Разработано согласно ТЗ "AI-Редактор журнала"

## 🤝 Поддержка

Если у вас возникли вопросы или проблемы:
1. Проверьте документацию API: `http://localhost:8000/docs`
2. Просмотрите логи: `docker-compose logs`
3. Создайте Issue в репозитории

---

**🎉 Спасибо за использование AI-Редактора Журнала!**
