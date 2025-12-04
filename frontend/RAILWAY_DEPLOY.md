# 🚂 Railway.com Deployment Guide

Complete guide to deploying your React + AI application to Railway.com

## 🌟 Why Railway?

- ✅ **Free Tier**: $5 free credit every month
- ✅ **Easy Deployment**: Git push to deploy
- ✅ **Auto-scaling**: Handles traffic automatically
- ✅ **Environment Variables**: Secure API key management
- ✅ **Custom Domains**: Free HTTPS
- ✅ **Zero Configuration**: Works out of the box

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **OpenRouter API Key** - Get free key from [openrouter.ai/keys](https://openrouter.ai/keys)

## 🚀 Quick Deployment (5 minutes)

### Step 1: Prepare Your Repository

Your repository is already configured with:
- ✅ `railway.json` - Railway configuration
- ✅ `nixpacks.toml` - Build configuration
- ✅ `package.json` with `start` script
- ✅ Production server (`serve`)

### Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select your `autoredactor` repository
6. Railway will automatically detect it's a Node.js project

### Step 3: Configure Environment Variables

1. In Railway dashboard, go to your project
2. Click on **"Variables"** tab
3. Add the following variable:

```
VITE_OPENROUTER_API_KEY=your_actual_openrouter_api_key_here
```

**How to get OpenRouter API Key:**
- Go to [openrouter.ai/keys](https://openrouter.ai/keys)
- Sign up (free)
- Create a new API key
- You get $1 free credit!
- Copy the key and paste it in Railway

### Step 4: Deploy!

1. Railway will automatically start building
2. Wait 2-3 minutes for build to complete
3. Railway will provide a URL like: `your-project.up.railway.app`
4. Click the URL to see your live site!

## 🔧 Configuration Files Explained

### `railway.json`
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### `nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm run start"
```

### `package.json` scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "start": "serve -s dist -l 3000",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

## 📊 Railway Dashboard Overview

### Deployments Tab
- View build logs
- Monitor deploy status
- Rollback to previous versions

### Variables Tab
- Add environment variables
- Manage API keys securely
- Changes trigger redeployment

### Metrics Tab
- CPU and memory usage
- Request count
- Response times

### Settings Tab
- Custom domain configuration
- Build settings
- Danger zone (delete project)

## 🔄 Continuous Deployment

Railway automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway will:
1. Detect the push
2. Build your project
3. Deploy automatically
4. Keep the same URL

## 🌐 Custom Domain Setup

### Add Custom Domain

1. Go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain: `yourdomain.com`
4. Railway provides DNS records
5. Add records to your DNS provider:

```
Type: CNAME
Name: www
Value: your-project.up.railway.app
```

6. Wait for DNS propagation (5-60 minutes)
7. SSL certificate auto-generated!

## 💰 Pricing & Free Tier

### Free Tier ($5/month credit)
- **Execution Time**: ~500 hours/month
- **Memory**: 512 MB RAM
- **Disk**: 1 GB
- **Build Time**: Unlimited
- **Perfect for**: Personal projects, demos, portfolios

### Paid Plans (if you exceed free tier)
- **Hobby**: $5/month for additional usage
- **Pro**: $20/month for professional projects
- **Enterprise**: Custom pricing

### Cost Calculator
Your React app typically uses:
- ~10 MB RAM
- Minimal CPU (static site)
- **Estimated cost**: $0-1/month

## 🐛 Troubleshooting

### Build Fails

**Error**: `npm ci failed`
```bash
# Solution: Make sure package-lock.json is committed
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

**Error**: `TypeScript errors`
```bash
# Solution: Fix TypeScript errors locally first
npm run build
# Fix any errors, then push
```

### Deploy Succeeds but Site Doesn't Load

**Issue**: White screen or 404 errors

**Solution 1**: Check environment variables
- Make sure `VITE_OPENROUTER_API_KEY` is set
- Variable names must start with `VITE_` for Vite

**Solution 2**: Check logs
```
Railway Dashboard → Deployments → View Logs
```

**Solution 3**: Verify start command
```bash
# Locally test production build
npm run build
npm run start
# Visit http://localhost:3000
```

### AI Chat Not Working

**Issue**: Chat doesn't respond

**Solutions**:
1. Check OpenRouter API key is valid
2. Verify environment variable is set correctly
3. Check browser console for errors
4. Try using free models (Llama 3.1 8B)

### High Memory Usage

**Solution**: Railway auto-scales, but if needed:
```json
// railway.json
{
  "deploy": {
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "resourceLimits": {
      "memoryMB": 512
    }
  }
}
```

## 📈 Monitoring & Logs

### View Logs
```
Railway Dashboard → Your Project → Deployments → View Logs
```

### Types of Logs:
- **Build logs**: npm install, TypeScript compilation
- **Deploy logs**: Server startup
- **Runtime logs**: Application errors, console.log

### Enable Advanced Logging
Add to your code:
```typescript
// Log all API requests
console.log('API Request:', { model, timestamp: new Date() });
```

## 🔒 Security Best Practices

### Environment Variables
✅ **DO:**
- Store API keys in Railway Variables
- Use `VITE_` prefix for frontend vars
- Rotate keys periodically

❌ **DON'T:**
- Commit `.env` files
- Hardcode API keys
- Share keys publicly

### API Rate Limiting
Add rate limiting to prevent abuse:
```typescript
// Example rate limit check
const MAX_REQUESTS_PER_MINUTE = 60;
```

## 🚀 Optimization Tips

### 1. Enable Gzip Compression
Railway enables this by default with `serve`!

### 2. Add Cache Headers
```javascript
// serve.json
{
  "headers": [
    {
      "source": "**/*.@(jpg|jpeg|png|gif|ico|svg|webp)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 3. Reduce Build Size
Already optimized with Vite!
- Tree shaking enabled
- Code splitting automatic
- Minification enabled

## 📱 Mobile & PWA

### Add to `index.html`:
```html
<meta name="theme-color" content="#000000">
<link rel="manifest" href="/manifest.json">
```

### Create `public/manifest.json`:
```json
{
  "name": "AI Chat App",
  "short_name": "AI Chat",
  "theme_color": "#000000",
  "background_color": "#000000",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 🎯 Performance Checklist

Before deploying:
- ✅ Run `npm run build` locally
- ✅ Test with `npm run start`
- ✅ Check bundle size (`dist` folder)
- ✅ Verify environment variables
- ✅ Test AI chat functionality
- ✅ Check mobile responsiveness
- ✅ Test different AI models

## 📚 Additional Resources

### Official Documentation
- [Railway Docs](https://docs.railway.app)
- [Nixpacks](https://nixpacks.com/docs)
- [OpenRouter](https://openrouter.ai/docs)

### Community
- [Railway Discord](https://discord.gg/railway)
- [Railway Community](https://help.railway.app)

### Related Guides
- [AI_INTEGRATION.md](./AI_INTEGRATION.md) - AI setup guide
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Development guide
- [README.md](./README.md) - Project overview

## 🎉 Success!

Your app is now live at: `https://your-project.up.railway.app`

Share it with friends, add it to your portfolio, and enjoy your AI-powered application!

### What's Next?

1. **Custom Domain**: Add your own domain
2. **Analytics**: Add Google Analytics or Plausible
3. **Monitoring**: Set up uptime monitoring
4. **Backup**: Enable automatic backups in Railway
5. **Scale**: Upgrade plan if needed

---

**Happy Deploying! 🚀**

Questions? Check [Railway Docs](https://docs.railway.app) or our [AI Integration Guide](./AI_INTEGRATION.md)
