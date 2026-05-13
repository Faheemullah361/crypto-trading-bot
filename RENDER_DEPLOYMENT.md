# 🚀 RENDER DEPLOYMENT GUIDE - DOCKER

## ✅ Setup Complete! 

### Already Done:
1. ✅ Dockerfile created - `backend/Dockerfile`
2. ✅ .dockerignore created 
3. ✅ application.properties updated with PORT variable
4. ✅ JAR file ready - `crypto-trading-app-1.0-SNAPSHOT.jar`

---

## 📋 RENDER DEPLOYMENT STEPS

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Add Docker support for Render deployment"
git push origin main
```

### Step 2: Create Render Account & New Service
1. Go to [render.com](https://render.com)
2. Sign up/Login
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repo

### Step 3: Configure Service
```
Name:                  crypto-trading-app
Environment:           Docker
Region:                (Select closest to you - default Ohio)
Branch:                main
```

### Step 4: Build Configuration  
```
Build Command:         (Leave empty)
Start Command:         (Leave empty - uses Dockerfile ENTRYPOINT)
```

### Step 5: Environment Variables
Click **"Add Environment Variable"** - Add these:

| Key | Value |
|-----|-------|
| `PORT` | `10000` |
| `FRONTEND_URL` | `https://your-frontend-url.onrender.com` |
| `API_COINGECKO_URL` | `https://api.coingecko.com/api/v3` |
| `API_BINANCE_URL` | `https://api.binance.com/api/v3` |

### Step 6: Deploy Settings
```
Plan:          Free (or Pro)
Auto-deploy:   Yes (optional)
```

### Step 7: Click **"Deploy"** ✅

---

## 📊 What Happens During Deploy

1. Render detects `Dockerfile` in root
2. Builds Docker image with Eclipse Temurin JRE 17 (Alpine)
3. Copies JAR to container
4. Exposes port 10000
5. Starts with: `java -jar app.jar`
6. Spring Boot reads `PORT=10000` from env

---

## 🔗 After Deployment

Your backend will be available at:
```
https://crypto-trading-app.onrender.com
```

Update frontend `config.ts`:
```typescript
export const API_BASE_URL = 'https://crypto-trading-app.onrender.com';
export const WS_URL = 'wss://crypto-trading-app.onrender.com';
```

---

## ❌ Troubleshooting

### "Port already in use"?
- ✅ Fixed! Using PORT env variable

### "Cannot connect to database"?
- Your app uses H2 in-memory (fine for MVP)
- For production → Add PostgreSQL service on Render

### Check Logs
```
Render Dashboard → Your Service → Logs tab
```

---

## 📦 Docker Image Size
- Base: 188MB (Alpine)
- Final: ~250-300MB (with JAR)

---

## 💰 Cost on Render
- **Free plan**: 750 hours/month = Always running
- **Pro plan**: $7/month (better specs)

---

**Bhai, bas karo ab! 🎉 Render pe successfully deploy hoga!**
