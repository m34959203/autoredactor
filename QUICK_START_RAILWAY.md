# 🚀 Railway Quick Start

Быстрый деплой за 5 минут!

## ⚡ Метод 1: Через Web UI (проще всего)

### 1. Создайте проект
```
railway.app → New Project → Deploy from GitHub
```

### 2. Добавьте базы данных
```
+ New → Database → PostgreSQL
+ New → Database → Redis
```

### 3. Создайте Backend сервис
```
+ New → GitHub Repo → autoredactor
Root Directory: backend
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Переменные окружения Backend:**
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
OPENROUTER_API_KEY=your-key-here
AI_MODEL=deepseek/deepseek-chat
PORT=${{PORT}}
```

### 4. Создайте Frontend сервис
```
+ New → GitHub Repo → autoredactor (тот же репо!)
Root Directory: frontend
Start Command: npx serve -s dist -l $PORT
```

**Переменные окружения Frontend:**
```
VITE_API_URL=https://ваш-backend.up.railway.app
PORT=${{PORT}}
```

### 5. Включите Public Networking
```
Backend Settings → Networking → Generate Domain
Frontend Settings → Networking → Generate Domain
```

✅ **Готово!** Откройте URL Frontend'а

---

## ⚡ Метод 2: Через Railway CLI

```bash
# 1. Установите CLI
curl -fsSL https://railway.app/install.sh | sh

# 2. Логин
railway login

# 3. Создайте проект
railway init

# 4. Добавьте базы
railway add --database postgres
railway add --database redis

# 5. Установите переменные
railway variables set OPENROUTER_API_KEY=your-key

# 6. Деплой
railway up
```

---

## 🔑 Важные переменные

| Переменная | Где взять | Обязательно |
|------------|-----------|-------------|
| `OPENROUTER_API_KEY` | [openrouter.ai](https://openrouter.ai/keys) | ✅ Да |
| `DATABASE_URL` | Railway PostgreSQL | ✅ Авто |
| `REDIS_URL` | Railway Redis | ✅ Авто |

---

## 📊 После деплоя

1. **Backend API**: `https://your-backend.up.railway.app/docs`
2. **Frontend**: `https://your-frontend.up.railway.app`
3. **Логи**: Railway Dashboard → Service → Deployments

---

## ❓ Проблемы?

### Backend падает
```bash
# Проверьте логи
railway logs

# Убедитесь, что все переменные установлены
railway variables
```

### Frontend не может подключиться к Backend
1. Проверьте `VITE_API_URL` в Frontend переменных
2. Убедитесь, что Backend домен правильный
3. Проверьте CORS в `backend/app/main.py`

### LibreOffice не установлен
Добавьте в `backend/nixpacks.toml`:
```toml
aptPkgs = ["libreoffice", "libreoffice-writer"]
```

---

## 💰 Стоимость

- **$5/месяц бесплатно**
- Потом ~$5-15/месяц для малых проектов

---

**📖 Полная документация**: см. `RAILWAY_DEPLOY.md`
