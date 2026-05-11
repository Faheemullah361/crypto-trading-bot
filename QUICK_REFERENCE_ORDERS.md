# 🚀 Quick Reference - Order System

## 📋 Order Types at a Glance

### ⚡ MARKET ORDER
- **Executes**: Immediately at current price
- **Best for**: Quick trades
- **Example**: Buy BTC right now at $45,000

### 🎯 LIMIT ORDER  
- **Executes**: When price reaches your target
- **Best for**: Buying dips or selling peaks
- **Example**: 
  - Buy BTC when it drops to $44,000
  - Sell BTC when it rises to $47,000

### 🛡️ STOP-LOSS ORDER
- **Executes**: When price drops to stop level
- **Best for**: Protecting against losses
- **Example**: Sell BTC if price drops to $43,000

---

## 🎯 Quick Actions

### Place Market Order
```
1. Select coin
2. Choose BUY/SELL
3. Select MARKET mode
4. Enter quantity
5. Click Place Order
```

### Place Limit Order
```
1. Select coin
2. Choose BUY/SELL
3. Select LIMIT mode
4. Enter limit price
5. Enter quantity
6. Click Place Order
```

### Place Stop-Loss
```
1. Select coin
2. Choose SELL
3. Select STOP_LOSS mode
4. Enter stop price
5. Enter quantity
6. Click Place Order
```

### Cancel Order
```
1. Go to Order Book
2. Find pending order
3. Click Cancel button
```

### View Statistics
```
1. Go to Order Book
2. Click Statistics tab
3. View all metrics
```

---

## 📊 API Quick Reference

### Create Order
```bash
POST /api/trading/orders
Body: { symbol, type, quantity, price }
```

### Create Limit Order
```bash
POST /api/trading/orders/advanced
Body: { symbol, type, quantity, price, orderMode: "LIMIT", limitPrice }
```

### Get Orders
```bash
GET /api/trading/orders
GET /api/trading/orders?status=PENDING
GET /api/trading/orders?symbol=BTC
```

### Cancel Order
```bash
DELETE /api/trading/orders/{orderId}
```

### Get Statistics
```bash
GET /api/trading/orders/stats
```

---

## 🎨 Status Colors

| Status | Color | Meaning |
|--------|-------|---------|
| PENDING | 🟡 Yellow | Waiting to execute |
| FILLED | 🟢 Green | Successfully completed |
| CANCELLED | ⚪ Gray | Cancelled by user |
| PARTIALLY_FILLED | 🔵 Blue | Partial execution |

---

## ⚙️ Configuration

### Backend Port
```
8080
```

### Frontend Port
```
5173
```

### Order Processing Interval
```
Every 10 seconds
```

### Database
```
H2 in-memory (auto-creates tables)
```

---

## 🔍 Troubleshooting

### Backend Not Starting
```bash
# Check if port 8080 is free
netstat -ano | findstr "8080"

# Kill process if needed
Get-Process | Where-Object {$_.ProcessName -like "*java*"} | Stop-Process -Force
```

### Frontend Not Connecting
```bash
# Check if backend is running
curl http://localhost:8080/api/trading/orders
```

### Orders Not Executing
1. Check backend logs
2. Verify balance/holdings
3. Check order mode (LIMIT orders wait for price)
4. Verify scheduled task is running

---

## 💡 Pro Tips

### 1. Use Limit Orders for Better Prices
Instead of market orders, set limit orders slightly below (buy) or above (sell) current price.

### 2. Always Set Stop-Loss
Protect your investment by setting stop-loss orders for every position.

### 3. Use Filters Effectively
Use filters in Order Book to quickly find specific orders.

### 4. Monitor Statistics
Regularly check statistics to understand your trading patterns.

### 5. Start Small
Test with small quantities first to understand the system.

---

## 📱 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Switch to Manual Tab | Click "Manual Trading" |
| Switch to Bot Tab | Click "Automated Bots" |
| Cancel Order | Click "Cancel" button |
| Clear Filters | Click "✕" button |

---

## 🎓 Learning Resources

### Beginner
1. Start with market orders
2. Understand order execution
3. Learn to read Order Book

### Intermediate
1. Practice limit orders
2. Use filters and search
3. Track portfolio performance

### Advanced
1. Combine multiple order types
2. Set up protection strategies
3. Analyze statistics

---

## 📈 Common Strategies

### Buy the Dip
```
Current: $45,000
Set LIMIT BUY: $44,000
Result: Automatically buy when price drops
```

### Take Profit
```
Bought at: $45,000
Set LIMIT SELL: $47,000
Result: Automatically sell when price rises
```

### Stop Loss
```
Bought at: $45,000
Set STOP_LOSS: $43,000
Result: Limit loss to $2,000
```

### Both Sides
```
Bought at: $45,000
Set LIMIT SELL: $47,000 (profit)
Set STOP_LOSS: $43,000 (protection)
Result: Protected on both sides
```

---

## ✅ Checklist

Before trading:
- [ ] Backend is running on port 8080
- [ ] Frontend is running on port 5173
- [ ] Can see coins in dashboard
- [ ] Balance is visible
- [ ] Test with small order first

---

## 📞 Quick Help

### Can't place order?
- Check balance (for BUY)
- Check holdings (for SELL)
- Verify quantity > 0
- Verify price > 0

### Order not executing?
- MARKET orders: Should execute immediately
- LIMIT orders: Wait for price to reach limit
- STOP_LOSS orders: Wait for price to hit stop

### Can't cancel order?
- Only PENDING orders can be cancelled
- FILLED orders cannot be cancelled

---

## 🎉 You're Ready!

Now you can:
✅ Place market orders
✅ Set limit orders
✅ Use stop-loss protection
✅ Track your portfolio
✅ View statistics
✅ Filter and search orders

**Happy Trading! 🚀**
