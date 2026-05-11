# 🔧 Backend Loading Issue - Solution

## Problem
Backend نہیں چل رہا تھا اور market data show نہیں ہو رہا تھا۔

## Solution Steps

### Step 1: Start Backend
Backend کو شروع کرنے کے لیے:

```bash
# Terminal 1 - Backend شروع کریں
cd backend
.\mvnw.cmd spring-boot:run -DskipTests
```

**Important:** Is terminal کو **band نہ کریں** اور **Ctrl+C نہ دبائیں**۔ Backend چلتا رہنا چاہیے۔

### Step 2: Wait for Backend to Start
Backend شروع ہونے میں 10-15 seconds لگتے ہیں۔ یہ message آنے کا wait کریں:

```
Started CryptoTradingApplication in X seconds
Tomcat started on port(s): 8080
```

### Step 3: Test Backend
Backend test کرنے کے لیے نیا terminal کھولیں:

```bash
# نیا terminal
curl http://localhost:8080/api/coins/top
```

اگر JSON data آئے تو backend صحیح چل رہا ہے۔

### Step 4: Start Frontend
Frontend شروع کریں:

```bash
# Terminal 2 - نیا terminal
cd frontend
npm run dev
```

### Step 5: Open Browser
Browser میں کھولیں:
```
http://localhost:5173
```

## Common Issues & Solutions

### Issue 1: Port 8080 Already in Use
```bash
# Solution: پرانی Java process کو بند کریں
Get-Process | Where-Object {$_.ProcessName -like "*java*"} | Stop-Process -Force
```

### Issue 2: Backend Band Ho Jata Hai
- Terminal window **close نہ کریں**
- **Ctrl+C press نہ کریں**
- Backend terminal کو minimize کر دیں running state میں

### Issue 3: "Failed to load market data"
1. Check کریں کہ backend port 8080 پر چل رہا ہے:
   ```bash
   netstat -ano | findstr "8080"
   ```
2. Backend logs دیکھیں errors کے لیے
3. Internet connection check کریں (external APIs کے لیے)

## Using the Batch Files

میں نے آسانی کے لیے 2 batch files بنا دیے ہیں:

### 1. Start Backend
Double-click کریں:
```
start-backend.bat
```

### 2. Start Frontend
```
cd frontend
npm run dev
```

## Architecture

```
Frontend (Port 5173)
    ↓
    HTTP Requests
    ↓
Backend (Port 8080)
    ↓
    External APIs
    ↓
CoinGecko / Binance APIs
```

## API Endpoints

Backend یہ endpoints provide کرتا ہے:

1. **Get Coins**: `GET /api/coins/top?limit=6`
2. **Get Price**: `GET /api/coins/{coinId}/price`
3. **Get Chart**: `GET /api/coins/{coinId}/chart?days=30`
4. **Market Data**: `GET /api/market/ticker/{symbol}`
5. **Order Book**: `GET /api/market/orderbook/{symbol}`

## Testing Backend Manually

PowerShell میں test کریں:

```powershell
# Test 1: Get coins
$response = Invoke-WebRequest -Uri "http://localhost:8080/api/coins/top" -UseBasicParsing
$response.Content | ConvertFrom-Json

# Test 2: Get specific coin price
Invoke-RestMethod -Uri "http://localhost:8080/api/coins/btc/price"

# Test 3: Check server status
Test-NetConnection -ComputerName localhost -Port 8080
```

## Debug Mode

اگر issues ہیں تو debug mode میں چلائیں:

```bash
cd backend
.\mvnw.cmd spring-boot:run -DskipTests -Dlogging.level.com.cryptotrading=DEBUG
```

## Quick Test

سب کچھ صحیح ہے یا نہیں، یہ test کریں:

```bash
# 1. Backend running?
curl http://localhost:8080/api/coins/top

# 2. Frontend running?
curl http://localhost:5173

# 3. Ports listening?
netstat -ano | findstr "8080 5173"
```

## Success Criteria

✅ Backend starts without errors  
✅ Port 8080 is listening  
✅ API endpoints return JSON data  
✅ Frontend connects successfully  
✅ Market data displays in browser  

## Need Help?

اگر پھر بھی issue ہو تو:
1. Backend terminal کی full output share کریں
2. Browser console errors دیکھیں (F12)
3. Network tab میں failed requests check کریں
