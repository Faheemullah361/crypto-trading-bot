# 📋 Order Management System - Complete Guide

## Overview
The order management system ab complete ho gaya hai with advanced features including limit orders, stop-loss orders, and comprehensive order tracking.

## ✨ Features

### 1. Order Types
- **Market Orders** ⚡ - Execute immediately at current price
- **Limit Orders** 🎯 - Execute only at specified price or better
- **Stop-Loss Orders** 🛡️ - Automatic sell when price hits stop price

### 2. Order Tracking
- Real-time order updates
- Order history with filters
- Trade history
- Portfolio tracking

### 3. Advanced Filters
- Filter by Status (Pending, Filled, Cancelled, Partially Filled)
- Filter by Type (Buy, Sell)
- Filter by Symbol
- Search by Order ID or Symbol

### 4. Order Statistics
- Total orders count
- Pending orders
- Filled orders
- Cancelled orders
- Fill rate percentage
- Total trades

## 🎯 How to Use

### Creating a Market Order
1. Go to Trading Panel
2. Select "Manual Trading" tab
3. Choose BUY or SELL
4. Select "MARKET" mode
5. Enter quantity
6. Click Place Order

### Creating a Limit Order
1. Select "LIMIT" mode
2. Enter your target price in "Limit Price" field
3. **For BUY**: Order executes when market price ≤ limit price
4. **For SELL**: Order executes when market price ≥ limit price
5. Enter quantity and place order

### Creating a Stop-Loss Order
1. Select "STOP_LOSS" mode
2. Enter stop price (protection level)
3. Order executes when market price ≤ stop price
4. Protects your holdings from major losses
5. Enter quantity and place order

### Managing Orders
1. Go to "Order Book" section
2. View all your orders with real-time status
3. Use filters to find specific orders
4. Cancel pending orders by clicking "Cancel" button
5. Switch to "Trade History" to see executed orders

## 📊 API Endpoints

### Backend Endpoints

#### Create Market Order
```http
POST /api/trading/orders
Content-Type: application/json

{
  "symbol": "BTC",
  "type": "BUY",
  "quantity": 0.01,
  "price": 45000
}
```

#### Create Advanced Order (Limit/Stop-Loss)
```http
POST /api/trading/orders/advanced
Content-Type: application/json

{
  "symbol": "BTC",
  "type": "BUY",
  "quantity": 0.01,
  "price": 45000,
  "orderMode": "LIMIT",
  "limitPrice": 44000
}
```

#### Get All Orders
```http
GET /api/trading/orders
GET /api/trading/orders?status=PENDING
GET /api/trading/orders?symbol=BTC
```

#### Get Pending Orders Only
```http
GET /api/trading/orders/pending
```

#### Get Order by ID
```http
GET /api/trading/orders/{orderId}
```

#### Cancel Order
```http
DELETE /api/trading/orders/{orderId}
```

#### Get All Trades
```http
GET /api/trading/trades
```

#### Get Portfolio Summary
```http
GET /api/trading/portfolio
```

#### Get Order Statistics
```http
GET /api/trading/orders/stats
```

#### Get Balance
```http
GET /api/trading/balance
```

## 🏗️ Architecture

### Backend Components

1. **Order.java** - Enhanced order model with:
   - Order modes (MARKET, LIMIT, STOP_LOSS, TRAILING_STOP)
   - Order statuses (PENDING, FILLED, CANCELLED, PARTIALLY_FILLED, EXPIRED)
   - Limit price and stop price fields
   - Filled quantity tracking
   - Strategy and bot ID linking

2. **OrderRepository.java** - JPA repository with:
   - Find by status, type, symbol
   - Find pending orders
   - Order statistics queries
   - Volume calculations

3. **OrderExecutionService.java** - Core service with:
   - Order creation and validation
   - Automatic order execution
   - Portfolio management
   - Scheduled limit order processing (every 10 seconds)
   - Balance and holdings tracking

4. **TradingControllerNew.java** - REST controller with:
   - Standard order endpoints
   - Advanced order endpoint
   - Filtering and searching
   - Statistics endpoint

### Frontend Components

1. **TradingPanel.tsx** - Enhanced with:
   - Order mode selection
   - Limit price input
   - Stop price input
   - Visual indicators for each mode
   - Real-time validation

2. **OrderBook.tsx** - Complete rewrite with:
   - Three tabs: Orders, Trades, Statistics
   - Advanced filtering system
   - Search functionality
   - Real-time updates
   - Order cancellation

## 💡 Order Execution Logic

### Market Orders
```
1. Validate balance/holdings
2. Create order with PENDING status
3. Immediately execute if valid
4. Update to FILLED status
5. Record trade
6. Update portfolio
```

### Limit Orders
```
1. Create order with PENDING status
2. Save to database
3. Scheduled task checks every 10 seconds
4. Execute when price condition met:
   - BUY: market price ≤ limit price
   - SELL: market price ≥ limit price
5. Update to FILLED status
```

### Stop-Loss Orders
```
1. Create order with PENDING status
2. Monitor price continuously
3. Execute when price ≤ stop price
4. Protects against losses
5. Update to FILLED status
```

## 📈 Portfolio Management

### Balance Tracking
- Initial balance: $10,000
- Updated with each trade
- Real-time balance display

### Holdings Tracking
- Quantity per symbol
- Average purchase price
- Current market price
- Unrealized P&L
- Realized P&L

### P&L Calculation
```
Unrealized P&L = (Current Price - Avg Price) × Quantity
Realized P&L = Sum of profits from completed trades
Total P&L = Realized P&L + Unrealized P&L
```

## 🔧 Technical Details

### Database Schema
```sql
CREATE TABLE orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  symbol VARCHAR(10) NOT NULL,
  type VARCHAR(10) NOT NULL,
  order_mode VARCHAR(20) NOT NULL DEFAULT 'MARKET',
  quantity DECIMAL(19,8),
  price DECIMAL(19,8),
  limit_price DECIMAL(19,8),
  stop_price DECIMAL(19,8),
  filled_quantity DECIMAL(19,8) DEFAULT 0,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  filled_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  strategy_id VARCHAR(50),
  bot_id VARCHAR(50),
  notes VARCHAR(500)
);

CREATE TABLE trades (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  symbol VARCHAR(10) NOT NULL,
  type VARCHAR(10) NOT NULL,
  quantity DECIMAL(19,8),
  price DECIMAL(19,8),
  total_value DECIMAL(19,8),
  strategy_id VARCHAR(50),
  timestamp TIMESTAMP NOT NULL
);
```

### Scheduled Tasks
- **processLimitOrders()**: Runs every 10 seconds
- Checks all pending orders
- Executes orders when conditions met
- Logs execution details

## 🎨 UI Features

### Order Mode Indicators
- **MARKET** ⚡: Blue, immediate execution
- **LIMIT** 🎯: Light blue, conditional execution
- **STOP_LOSS** 🛡️: Red, protective execution

### Status Badges
- **PENDING**: Yellow - waiting for execution
- **FILLED**: Green - successfully executed
- **CANCELLED**: Gray - cancelled by user
- **PARTIALLY_FILLED**: Blue - partially executed

### Real-time Updates
- Orders refresh every 5 seconds
- Trades refresh every 5 seconds
- Statistics update automatically

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
.\mvnw.cmd spring-boot:run -DskipTests
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Place Your First Order
1. Open http://localhost:5173
2. Go to Trading Panel
3. Select a coin
4. Choose order type (BUY/SELL)
5. Select order mode
6. Enter quantity
7. Click "Place Order"

### 4. View Orders
1. Go to Order Book section
2. See your orders in real-time
3. Use filters to find specific orders
4. Check statistics tab for overview

## ⚠️ Important Notes

1. **Limit orders**: Execute automatically when price conditions are met
2. **Stop-loss orders**: Protect your holdings from major losses
3. **Balance required**: Ensure sufficient balance before placing buy orders
4. **Holdings required**: Ensure you own the asset before placing sell orders
5. **Price validation**: Prices must be greater than zero
6. **Quantity validation**: Quantities must be greater than zero

## 🔐 Error Handling

### Common Errors
- "Insufficient balance" - Not enough funds for buy order
- "Insufficient holdings" - Don't own enough to sell
- "Quantity must be greater than zero" - Invalid quantity
- "Price must be greater than zero" - Invalid price
- "Limit price is required" - Missing limit price for limit order
- "Stop price is required" - Missing stop price for stop-loss order

### Error Recovery
1. Check error message
2. Verify balance/holdings
3. Validate input values
4. Try again with correct values

## 📝 Testing

### Test Market Order
```bash
curl -X POST http://localhost:8080/api/trading/orders \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTC",
    "type": "BUY",
    "quantity": 0.01,
    "price": 45000
  }'
```

### Test Limit Order
```bash
curl -X POST http://localhost:8080/api/trading/orders/advanced \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTC",
    "type": "BUY",
    "quantity": 0.01,
    "price": 45000,
    "orderMode": "LIMIT",
    "limitPrice": 44000
  }'
```

### Test Stop-Loss Order
```bash
curl -X POST http://localhost:8080/api/trading/orders/advanced \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTC",
    "type": "SELL",
    "quantity": 0.01,
    "price": 45000,
    "orderMode": "STOP_LOSS",
    "stopPrice": 43000
  }'
```

## 🎯 Success Criteria

✅ Market orders execute immediately
✅ Limit orders wait for price conditions
✅ Stop-loss orders protect holdings
✅ Orders are tracked in database
✅ Real-time updates work
✅ Filters work correctly
✅ Portfolio tracks accurately
✅ Statistics calculate correctly
✅ Order cancellation works
✅ Error handling is comprehensive

## 🌟 Next Steps

Future enhancements could include:
- Trailing stop orders
- OCO (One-Cancels-Other) orders
- Good-till-cancelled (GTC) orders
- Fill-or-kill (FOK) orders
- Partial fills support
- Order modification
- Advanced charting with order markers
- Order alerts and notifications
- Export order history to CSV
- Trading journal with notes

## 📞 Support

If you encounter any issues:
1. Check backend logs for errors
2. Check browser console for frontend errors
3. Verify database connection
4. Ensure all services are running
5. Check API endpoints with curl/Postman

## 🎉 Conclusion

Order management system ab fully functional hai with:
- ✅ Market orders
- ✅ Limit orders
- ✅ Stop-loss orders
- ✅ Order tracking
- ✅ Trade history
- ✅ Portfolio management
- ✅ Advanced filtering
- ✅ Real-time updates
- ✅ Statistics dashboard
- ✅ Error handling

Ab aap confidently trading kar sakte hain! 🚀
