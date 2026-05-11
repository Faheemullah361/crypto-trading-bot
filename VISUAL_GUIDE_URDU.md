# 🎬 Step-by-Step Visual Guide (تصویری راہنما)

## Method 1: AUTO START (سب سے آسان!) ⭐

### Step 1: File تلاش کریں
```
📁 crypto-trading-app/
   └── 📄 START_ALL.bat    ← یہ فائل
```

### Step 2: Double Click
```
🖱️ START_ALL.bat پر double-click کریں
```

### Step 3: 2 Windows کھلیں گی
```
┌─────────────────────────────────┐
│  Crypto Backend (Window 1)      │
│  Port: 8080                     │
│  Status: Starting...            │
└─────────────────────────────────┘

Wait 15 seconds... ⏳

┌─────────────────────────────────┐
│  Crypto Frontend (Window 2)     │
│  Port: 5173                     │
│  Status: Starting...            │
└─────────────────────────────────┘
```

### Step 4: Browser کھولیں
```
🌐 http://localhost:5173
```

---

## Method 2: MANUAL START (قدم بہ قدم)

### Step 1: Backend Terminal

```
┌─────────────────────────────────────────────┐
│ PowerShell/CMD                              │
├─────────────────────────────────────────────┤
│ PS C:\> cd crypto-trading-app               │
│ PS C:\crypto-trading-app> cd backend        │
│ PS C:\...\backend> .\mvnw.cmd spring-boot:run -DskipTests
│                                             │
│ [INFO] Building Crypto Trading App...      │
│ [INFO] Spring Boot starting...             │
│ ⏳ Wait 10-15 seconds...                    │
│                                             │
│ 🟢 Started CryptoTradingApplication         │
│    Tomcat started on port(s): 8080          │
│                                             │
│ ✅ Backend Ready!                           │
└─────────────────────────────────────────────┘

⚠️ IS WINDOW KO BAND NA KAREIN!
```

### Step 2: Frontend Terminal (نیا terminal)

```
┌─────────────────────────────────────────────┐
│ PowerShell/CMD (NEW WINDOW)                 │
├─────────────────────────────────────────────┤
│ PS C:\> cd crypto-trading-app               │
│ PS C:\crypto-trading-app> cd frontend       │
│ PS C:\...\frontend> npm run dev             │
│                                             │
│ VITE v5.x.x  ready in 500ms                │
│                                             │
│ ➜  Local:   http://localhost:5173          │
│ ➜  Network: use --host to expose           │
│                                             │
│ ✅ Frontend Ready!                          │
└─────────────────────────────────────────────┘

⚠️ YEH BHI BAND NA KAREIN!
```

### Step 3: Browser

```
┌──────────────────────────────────────────────────┐
│ 🌐 Browser - http://localhost:5173              │
├──────────────────────────────────────────────────┤
│                                                  │
│  🚀 Crypto Trading Bot                          │
│  ────────────────────────────────               │
│                                                  │
│  💰 Markets                                     │
│  ┌──────┬──────┬──────┬──────┐                 │
│  │ BTC  │ ETH  │ BNB  │ SOL  │                 │
│  │$45k  │$2.5k │$320  │$75   │                 │
│  │+2.5% │+1.8% │-0.5% │+3.2% │                 │
│  └──────┴──────┴──────┴──────┘                 │
│                                                  │
│  📊 Live Chart                                  │
│  ┌────────────────────────┐                    │
│  │  ╱╲    ╱╲               │                    │
│  │ ╱  ╲  ╱  ╲╱╲           │                    │
│  │╱    ╲╱       ╲          │                    │
│  └────────────────────────┘                    │
│                                                  │
│  ✅ Market data loading!                        │
└──────────────────────────────────────────────────┘
```

---

## Common Screens

### ✅ SUCCESS Screen

```
┌──────────────────────────────────────────┐
│ Backend Terminal                         │
├──────────────────────────────────────────┤
│ Started CryptoTradingApplication in 11s  │
│ Tomcat started on port(s): 8080 (http)   │
│                                          │
│ 🟢 Status: RUNNING                       │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ Frontend Terminal                        │
├──────────────────────────────────────────┤
│ VITE ready in 500ms                      │
│ Local: http://localhost:5173             │
│                                          │
│ 🟢 Status: RUNNING                       │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ Browser                                  │
├──────────────────────────────────────────┤
│ Coins loading... ⚡                      │
│ BTC, ETH, BNB showing with prices        │
│                                          │
│ ✅ ALL WORKING!                          │
└──────────────────────────────────────────┘
```

### ❌ ERROR Screens

#### Error 1: Port Already in Use

```
┌──────────────────────────────────────────┐
│ Backend Terminal                         │
├──────────────────────────────────────────┤
│ ❌ Error: Port 8080 is already in use    │
│                                          │
│ FIX:                                     │
│ Get-Process | Where {$_.ProcessName      │
│   -like "*java*"} | Stop-Process -Force  │
└──────────────────────────────────────────┘
```

#### Error 2: Backend Not Running

```
┌──────────────────────────────────────────┐
│ Browser Console (F12)                    │
├──────────────────────────────────────────┤
│ ❌ Failed to fetch                       │
│ ❌ net::ERR_CONNECTION_REFUSED           │
│    http://localhost:8080/api/coins/top   │
│                                          │
│ FIX: Backend start کریں!                │
└──────────────────────────────────────────┘
```

#### Error 3: npm not found

```
┌──────────────────────────────────────────┐
│ Frontend Terminal                        │
├──────────────────────────────────────────┤
│ ❌ 'npm' is not recognized               │
│                                          │
│ FIX: Node.js install کریں               │
│ Download: https://nodejs.org             │
└──────────────────────────────────────────┘
```

---

## Testing Commands

### Check Backend

```bash
# Method 1: curl
curl http://localhost:8080/api/coins/top

# Method 2: PowerShell
Invoke-RestMethod http://localhost:8080/api/coins/top

# Method 3: Browser
http://localhost:8080/api/coins/top
```

**Expected Output:**
```json
[
  {
    "symbol": "BTC",
    "name": "Bitcoin",
    "currentPrice": 45000,
    "priceChangePercent24h": 2.85
  },
  ...
]
```

### Check Ports

```bash
netstat -ano | findstr "8080 5173"
```

**Expected Output:**
```
TCP  0.0.0.0:8080   LISTENING    12156
TCP  0.0.0.0:5173   LISTENING    14892
```

---

## File Structure Visual

```
crypto-trading-app/
│
├── 📄 START_ALL.bat           ⭐ سب start کرنے کے لیے
├── 📄 START_BACKEND.bat       💚 Backend only
├── 📄 START_FRONTEND.bat      💙 Frontend only
│
├── 📄 README_URDU.md          📖 اردو گائیڈ
├── 📄 BACKEND_FIX_GUIDE_URDU.md  🔧 Fix guide
├── 📄 VISUAL_GUIDE_URDU.md    🎬 یہ فائل
│
├── 📁 backend/                🟢 Spring Boot
│   ├── 📁 src/
│   ├── 📄 pom.xml
│   └── 📄 mvnw.cmd           ← Backend starter
│
└── 📁 frontend/               🔵 React + Vite
    ├── 📁 src/
    ├── 📄 package.json
    └── 📄 vite.config.ts
```

---

## Timeline (Normal Startup)

```
0:00  🖱️ Double-click START_ALL.bat
0:01  📦 Backend terminal opens
0:02  ⏳ Maven downloading (first time only)
0:05  ⏳ Spring Boot initializing
0:10  ⏳ Database setup
0:15  🟢 Backend READY (port 8080)
0:16  📦 Frontend terminal opens
0:17  ⏳ Vite starting
0:18  🟢 Frontend READY (port 5173)
0:19  🌐 Browser auto-opens
0:20  ⚡ Market data loads
0:21  ✅ FULLY OPERATIONAL!
```

---

## Keyboard Shortcuts

### In Terminal
- `Ctrl+C` = Stop (❌ USE NAHI KAREIN!)
- `Ctrl+Z` = Pause (❌ USE NAHI KAREIN!)
- Minimize = OK ✅
- Close Window = ❌ Backend/Frontend band ho jayega

### In Browser
- `F12` = Developer Console کھولیں
- `Ctrl+R` = Reload
- `Ctrl+Shift+R` = Hard Reload

---

## Status Indicators

### Terminal Colors

```
🟢 GREEN   = Success/Running
🟡 YELLOW  = Warning
🔴 RED     = Error
⚪ WHITE   = Info/Logs
```

### Backend Status Messages

```
✅ "Started CryptoTradingApplication"
✅ "Tomcat started on port(s): 8080"
✅ "Completed initialization"

⚠️  "Using generated security password"  (Normal)
❌ "Port 8080 was already in use"        (Fix needed)
❌ "Failed to start"                     (Fix needed)
```

### Frontend Status Messages

```
✅ "VITE ready in Xms"
✅ "Local: http://localhost:5173"

❌ "Failed to fetch"           (Backend نہیں چل رہا)
❌ "npm: command not found"    (Node.js نہیں ہے)
```

---

## Final Checklist ✓

Before browser کھولیں، یہ check کریں:

- [ ] Backend terminal کھلی ہے
- [ ] "Started CryptoTradingApplication" message آیا
- [ ] Frontend terminal کھلی ہے  
- [ ] "VITE ready" message آیا
- [ ] Dono terminals minimize ہیں (band نہیں!)
- [ ] Internet connection ہے

اگر سب ✅ ہیں:
👉 http://localhost:5173 کھولیں اور enjoy! 🎉

---

**Happy Trading! 📈🚀**
