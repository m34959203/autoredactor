# 🎨 Render Quick Start

Деплой за 5 минут!

## ⚡ Быстрый деплой (Blueprint)

### 1. Подготовка
```bash
git push origin main
```

### 2. На Render.com
```
New + → Blueprint → Подключить GitHub → Выбрать autoredactor
```

### 3. Добавить API ключ
```
Environment → Add Environment Variable
OPENROUTER_API_KEY = sk-or-v1-ваш-ключ
```

### 4. Deploy!
```
Render автоматически создаст:
✅ PostgreSQL
✅ Redis
✅ Web Service
```

✨ **Готово!** Откройте URL вашего приложения.

---

## 🔧 Ручной деплой

### Шаг 1: Создать базы данных

**PostgreSQL:**
```
New + → PostgreSQL → Free Plan → Create
```

**Redis:**
```
New + → Redis → Free Plan → Create
```

### Шаг 2: Создать Web Service

```
New + → Web Service → GitHub → autoredactor

Settings:
- Environment: Docker
- Dockerfile Path: ./Dockerfile.render
- Plan: Free
```

### Шаг 3: Переменные окружения

```env
DATABASE_URL=${{ai-editor-db.DATABASE_URL}}
REDIS_URL=${{ai-editor-redis.REDIS_URL}}
OPENROUTER_API_KEY=ваш-ключ
```

### Шаг 4: Deploy

```
Create Web Service → Wait 5-10 min → Done!
```

---

## 📊 Что получите

```
https://your-app.onrender.com
```

- 📁 Drag & Drop загрузка
- 🤖 AI извлечение метаданных
- 📋 Управление статьями
- 📄 PDF генерация
- 📚 Архив выпусков

---

## 💰 Стоимость

**Free:** Бесплатно 90 дней, потом ~$12/мес
**Starter:** ~$19/мес (лучше производительность)

---

## ❓ Проблемы?

**Не запускается:**
```
Dashboard → Logs → Проверить ошибки
```

**Frontend белый экран:**
```
Проверить: npm run build прошел успешно
```

**Backend не отвечает:**
```
curl https://your-app.onrender.com/health
```

---

**📖 Полная инструкция:** `RENDER_DEPLOY.md`
