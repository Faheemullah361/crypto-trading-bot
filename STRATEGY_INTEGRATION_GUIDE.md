# Strategy Integration Guide (Urdu/English)

## ✅ Ab Strategies Implement Ho Gayi Hain! / Strategies Now Implemented!

### Kya Changes Huay Hain? / What Changed?

#### 1. **StrategyManager** se Strategies Banao / Create Strategies from StrategyManager
- Strategy Manager mein 5 types ki strategies bana sakte hain:
  - **RSI Strategy**: Relative Strength Index based
  - **MACD Strategy**: Moving Average Convergence Divergence
  - **Moving Average Strategy**: Simple/Exponential Moving Average
  - **Manual Strategy**: Aap khud price targets set kar sakte hain
  - **Custom Strategy**: Apni custom conditions define karein

#### 2. **TradingPanel** mein Strategies Show Hoti Hain / Strategies Show in TradingPanel
- Jab aap Strategy Manager mein strategies banate hain, wo automatically Trading Panel mein dropdown mein show hoti hain
- Aap apni created strategy ko select kar ke bot start kar sakte hain
- Strategy ka naam, type aur symbol sab show hota hai

#### 3. **Active Bots** mein Strategy Information Display
- Jab bot chalta hai to active bots list mein strategy ka naam aur type show hota hai
- Aapko pata chalega ke kaunsi strategy kis bot ne use ki hai

---

## 🎯 Kaise Use Karein? / How to Use?

### Step 1: Strategy Banaiye / Create a Strategy
1. **Strategy Manager** tab kholen
2. Strategy type select karein (RSI, MACD, MA, Manual, Custom)
3. Strategy details fill karein:
   - **Name**: Strategy ka naam (e.g., "My Bitcoin RSI Strategy")
   - **Symbol**: Coin symbol (e.g., "BTC", "ETH")
   - **Parameters**: Strategy ke parameters (e.g., RSI period, thresholds)
4. **Enable** check karein (enabled strategies hi trading mein use ho sakti hain)
5. **Create Strategy** button click karein

### Step 2: Trading Panel Mein Strategy Select Karein / Select Strategy in Trading Panel
1. **Trading** tab kholen
2. **Bot Trading** sub-tab select karein
3. **Select Strategy from StrategyManager** dropdown kholen
4. Apni created strategy select karein
5. Strategy ki details dekh sakte hain (enabled/disabled status)

### Step 3: Bot Start Karein / Start the Bot
1. Strategy select karne ke baad **Start** button click karein
2. Bot start ho jayega aur active bots list mein show hoga
3. Bot ki details mein strategy name aur type dikh jayega:
   - 📊 Strategy: My Bitcoin RSI Strategy (RSI)

---

## 📋 Features / Khasiyat

### ✅ Dynamic Strategy Loading
- Strategies har 5 seconds mein automatically refresh hoti hain
- Naye create kiye strategies turant show hote hain
- Deleted strategies list se hat jate hain

### ✅ Strategy Status Indication
- **🟢 Enabled**: Strategy active hai aur use ki ja sakti hai
- **🔴 Disabled**: Strategy inactive hai
- Color coding se asani se pata chalta hai

### ✅ Built-in Fallback Strategies
- Agar aapne koi strategy nahi banayi to built-in strategies use kar sakte hain:
  - RSI Strategy
  - MA Strategy
  - MANUAL Strategy

### ✅ Strategy Information in Active Bots
- Running bot mein strategy ka naam show hota hai
- Strategy type (RSI, MACD, MA, etc.) dikh ta hai
- Bot ki performance track karna easy ho jata hai

---

## 🔧 Technical Details

### Frontend Changes
**File**: `frontend/src/components/TradingPanel.tsx`

1. **New Imports**:
```typescript
import type { TradingStrategy } from '../types';
import { StrategyService } from '../services/api';
```

2. **New State Variables**:
```typescript
const [selectedStrategy, setSelectedStrategy] = useState<TradingStrategy | null>(null);
const [availableStrategies, setAvailableStrategies] = useState<TradingStrategy[]>([]);
```

3. **Strategy Fetching**:
```typescript
useEffect(() => {
  const fetchStrategies = async () => {
    try {
      const strategies = await StrategyService.getAllStrategies();
      setAvailableStrategies(strategies);
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
    }
  };
  fetchStrategies();
  const interval = setInterval(fetchStrategies, 5000); // Refresh every 5s
  return () => clearInterval(interval);
}, []);
```

4. **Dynamic Dropdown**:
- User-created strategies primary option
- Built-in strategies as fallback
- Shows strategy name, type, symbol, and enabled status

### Backend Changes
**File**: `backend/src/main/java/com/cryptotrading/service/MultiThreadDemoService.java`

1. **New Maps for Strategy Tracking**:
```java
private Map<String, String> botStrategies; // Store strategy types
private Map<String, String> botStrategyNames; // Store strategy names
```

2. **Store Strategy Info on Bot Start**:
```java
botStrategies.put(botId, strategyType);
if (params != null && params.containsKey("strategyName")) {
    botStrategyNames.put(botId, (String) params.get("strategyName"));
}
```

3. **Return Strategy Info in Bot Status**:
```java
if (botStrategies.containsKey(botId)) {
    status.put("strategyType", botStrategies.get(botId));
}
if (botStrategyNames.containsKey(botId)) {
    status.put("strategyName", botStrategyNames.get(botId));
}
```

**File**: `backend/src/main/java/com/cryptotrading/controller/MultiThreadDemoController.java`

1. **Extract Strategy Name from Request**:
```java
if (request.containsKey("strategyName")) {
    if (manualParams == null) {
        manualParams = new HashMap<>();
    }
    manualParams.put("strategyName", request.get("strategyName"));
}
```

---

## 🚀 Testing / Test Kaise Karein

### Test Case 1: Create and Use Strategy
1. Strategy Manager mein RSI strategy banao
2. Trading panel mein wo strategy select karo
3. Bot start karo
4. Active bots mein verify karo ke strategy name show ho raha hai

### Test Case 2: Multiple Strategies
1. 2-3 different strategies banao (RSI, MACD, MA)
2. Trading panel dropdown mein sab strategies check karo
3. Different strategies se multiple bots start karo
4. Har bot apni strategy show kar raha ho

### Test Case 3: Enabled/Disabled Status
1. Strategy create karo but Enable checkbox uncheck rakho
2. Dropdown mein "✗ Disabled" dikh na chahiye
3. Strategy enable karo
4. "✓ Enabled" show hona chahiye

---

## 🎨 UI Details

### Strategy Dropdown Colors
- **Selected Strategy Background**:
  - 🟢 Green (`#d1fae5`) for enabled strategies
  - 🔴 Red (`#fee2e2`) for disabled strategies

### Active Bot Display
- **Strategy Info Color**: Blue (`#2563eb`)
- **Strategy Icon**: 📊 
- **Format**: `📊 Strategy: [Name] ([Type])`

---

## ⚠️ Important Notes / Zaroori Baatein

1. **Strategy Enable Karna Zaroori Hai**: Sirf enabled strategies hi bot mein use ho sakti hain
2. **Symbol Match**: Strategy aur selected coin ka symbol match hona chahiye
3. **Auto Refresh**: Strategies list har 5 seconds mein update hoti hai
4. **Fallback Option**: Agar koi strategy na ho to built-in strategies use kar sakte hain
5. **Backend Compatibility**: Strategies backend APIs se sync hoti hain

---

## 📊 API Endpoints Used

### Get All Strategies
```
GET http://localhost:8080/api/strategies
Response: Array of TradingStrategy objects
```

### Start Bot with Strategy
```
POST http://localhost:8080/api/demo/bot/start
Body: {
  "botId": "bot-123456789",
  "strategy": "RSI",
  "strategyName": "My Bitcoin Strategy",
  "symbol": "BTC",
  "price": 85000,
  "parameters": { ... }
}
```

### Get Bot Status
```
GET http://localhost:8080/api/demo/bot/status/{botId}
Response: {
  "botId": "bot-123456789",
  "running": true,
  "paused": false,
  "executedOrders": 5,
  "strategyType": "RSI",
  "strategyName": "My Bitcoin Strategy"
}
```

---

## ✨ Summary / Khulaasa

Ab aap:
1. ✅ Strategy Manager mein apni custom strategies bana sakte hain
2. ✅ Trading Panel mein un strategies ko dekh sakte hain
3. ✅ Strategies select kar ke bot start kar sakte hain
4. ✅ Active bots mein strategy information dekh sakte hain
5. ✅ Multiple bots ko different strategies ke saath run kar sakte hain

**Har feature fully implemented hai aur working condition mein hai!** 🎉
