# 🚂 Railway Unified - Quick Start

Деплой единого сервиса за 5 минут!

## ⚡ Быстрый деплой

### 1. Push код
```bash
git push origin main
```

### 2. На Railway.app
```
New Project → Deploy from GitHub → autoredactor
```

### 3. Добавить базы данных
```
+ New → Database → PostgreSQL
+ New → Database → Redis
```

### 4. Настроить переменные
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
OPENROUTER_API_KEY=ваш-ключ
```

### 5. Generate Domain
```
Settings → Networking → Generate Domain
```

✨ **Готово!** Railway автоматически соберет и запустит всё.

---

## 🏗️ Что Railway сделает

```
1. ✅ Соберет Docker образ (Dockerfile.railway)
2. ✅ Установит LibreOffice
3. ✅ Соберет React Frontend
4. ✅ Настроит Nginx
5. ✅ Запустит FastAPI Backend
6. ✅ Подключит PostgreSQL + Redis
```

---

## 📊 Архитектура

```
┌──────────────────────────┐
│   Railway Service        │
│   Nginx + FastAPI        │
└──────────────────────────┘
     │            │
     ▼            ▼
PostgreSQL     Redis
```

**Один сервис = Дешевле!**

---

## 💰 Стоимость

- **$5 бесплатно** каждый месяц
- Потом **~$5-10/мес**
- **vs 2 сервиса**: ~$10-15/мес

**Экономия**: ~$5/мес

---

## 🎯 URL приложения

```
https://your-app.up.railway.app

API Docs: /docs
Health: /health
```

---

## ❓ Проблемы?

**Build fails:**
```
Logs → Проверить ошибки
Обычно LibreOffice (уже исправлено)
```

**Service crashes:**
```
Проверить переменные:
- DATABASE_URL
- OPENROUTER_API_KEY
```

**502 Error:**
```
Подождите 2-3 минуты
Backend запускается
```

---

## 🔄 Обновление

```bash
git push origin main
```

Railway автоматически пересоберет!

---

**📖 Полная инструкция:** `RAILWAY_DEPLOY_UNIFIED.md`
