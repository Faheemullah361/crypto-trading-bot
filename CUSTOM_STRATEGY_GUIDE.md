# 🎯 Custom Strategy Guide - Fixed Issues

## Problems Solved ✅

### Issue 1: Custom Strategies Weren't Running Bots
**Status:** ✅ FIXED
- Bot now properly handles CUSTOM strategy types
- Bot launch properly maps strategy parameters to bot configuration
- Custom strategy names and types are now displayed in active bots list

### Issue 2: Symbol Selection During Strategy Creation
**Status:** ✅ FIXED - Made Optional
- Symbol field is now **optional** during strategy creation
- You can now create strategies **without** specifying a coin/symbol
- Select the coin **later when running the bot**

## How to Use Custom Strategies

### Step 1: Create a Custom Strategy
1. Go to **⚙️ Strategies** tab
2. Click **✨ New Strategy**
3. Fill in:
   - **Strategy Name** (required) - e.g., "My Bitcoin Bot"
   - **Coin Symbol** (optional) - e.g., "BTC, ETH" - leave empty if unsure
   - **Strategy Type** - Select **"Custom"**
4. Fill in custom parameters (buy/sell conditions)
5. Click **🚀 Create Strategy**

### Step 2: Run the Strategy as a Bot
1. Go to **📊 Trading** tab
2. Switch to **🤖 Automated Bots** section
3. Look for **⭐ Select Strategy from StrategyManager**
4. Select your custom strategy from the dropdown

#### If Strategy Has NO Symbol:
- A new dropdown appears: **🎯 Select Coin for This Strategy**
- Choose any coin (BTC, ETH, etc.)
- Click **🚀 Start Bot**

#### If Strategy Has a Symbol:
- It automatically uses that symbol
- Just click **🚀 Start Bot**

### Step 3: Monitor Your Bot
- Bot appears in **Active Bots** section
- Shows:
  - Bot ID
  - Strategy name & type
  - Current status (RUNNING, PAUSED, STOPPED)
  - Number of executed orders
- Control buttons: **▶️ Resume**, **⏸️ Pause**, **⏹️ Stop**

## Example Workflow

```
1. Strategy Manager Tab:
   ✨ Create Strategy "RSI Flip"
   - No symbol specified (left blank)
   - Type: CUSTOM with RSI parameters
   
2. Trading Tab → Automated Bots:
   ⭐ Select "RSI Flip" strategy
   🎯 Choose coin: Bitcoin (BTC)
   🚀 Start Bot
   
3. Active Bots:
   Bot running on BTC with "RSI Flip" strategy
   Orders executing automatically...
```

## Benefits of Symbol-Less Strategies

| Benefit | Description |
|---------|------------|
| **Flexibility** | Use same strategy on different coins without creating duplicates |
| **Reusability** | Create once, deploy on multiple coins |
| **Clean UI** | No need to pre-select coins during strategy setup |
| **Dynamic** | Choose coin at runtime based on market conditions |

## Troubleshooting

### Bot Not Starting?
- Check if strategy has symbol or if you selected a coin
- **Start Bot** button should be enabled (not grayed out)
- Ensure Backend is running on port 8080

### Strategy Shows in List But Won't Run?
1. Verify symbol is set (either in strategy or override)
2. Check Backend logs for errors
3. Ensure coin selection is valid

### Need to Change Coin?
- Create another bot with same strategy but different coin
- Or delete bot and start new one with different coin selection

## API Details

When bot starts with custom strategy:
```json
{
  "botId": "bot-1234567890",
  "strategy": "CUSTOM",
  "strategyId": "strategy-id-here",
  "strategyName": "My Custom Strategy",
  "coinId": "bitcoin",
  "symbol": "BTC",
  "price": 45000,
  "parameters": {
    "customName": "RSI Flip",
    "buyCondition": "RSI < 30",
    "sellCondition": "RSI > 70",
    "maxTradeSize": 10,
    "stopLoss": 5
  }
}
```

---

**All fixes implemented!** 🎉 Your custom strategies now work perfectly with flexible coin selection! 🚀
