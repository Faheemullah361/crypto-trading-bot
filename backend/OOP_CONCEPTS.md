# Java OOP Concepts Implementation

This document explains all Object-Oriented Programming concepts implemented in the Crypto Trading Application backend.

---

## 1. INHERITANCE

### Base Class: `BaseTradingStrategy<T>` (Abstract)
**Location:** `backend/src/main/java/com/cryptotrading/strategy/BaseTradingStrategy.java`

```java
public abstract class BaseTradingStrategy<T> {
    protected Lock strategyLock = new ReentrantLock();
    protected boolean isActive = false;
    
    public abstract T analyzeMarket(Coin coin, List<Double> priceHistory);
    public abstract Order generateOrder(T analysis, double currentPrice);
}
```

### Derived Classes:
1. **RSIStrategy** - Extends `BaseTradingStrategy<Double>`
   - Calculates Relative Strength Index (RSI)
   - Generates buy/sell signals based on oversold/overbought conditions

2. **MovingAverageStrategy** - Extends `BaseTradingStrategy<Map<String, Double>>`
   - Calculates short and long moving averages
   - Detects golden cross (buy) and death cross (sell) signals

**Demonstration:**
- Child classes override abstract methods
- Polymorphism: Different strategies can be used interchangeably
- Code reusability: Common functionality in base class

---

## 2. MULTI-THREADING (with start, stop, sleep)

### A. Thread Extension: `TradingBotRunner`
**Location:** `backend/src/main/java/com/cryptotrading/thread/TradingBotRunner.java`

```java
public class TradingBotRunner extends Thread {
    @Override
    public void run() {
        while (running) {
            executeTradingCycle();
            Thread.sleep(executionInterval); // SLEEP demonstration
        }
    }
    
    public void stopBot() {
        running = false;
        interrupt(); // STOP demonstration
    }
}
```

**Features:**
- `Thread.start()` - Starts the bot in new thread
- `Thread.sleep()` - Pauses execution for specified interval
- `Thread.interrupt()` - Stops the thread gracefully
- Custom thread names for debugging

### B. Runnable Implementation: `OrderProcessor`
**Location:** `backend/src/main/java/com/cryptotrading/thread/OrderProcessor.java`

```java
public class OrderProcessor implements Runnable {
    @Override
    public void run() {
        while (running) {
            Order order = orderQueue.takeOrder();
            processOrder(order);
            Thread.sleep(1000);
        }
    }
}
```

**Features:**
- Alternative way to create threads using Runnable
- Consumer thread that processes orders from queue
- Demonstrates thread lifecycle management

---

## 3. SYNCHRONIZATION

### A. Synchronized Methods
**Location:** Multiple files

```java
// In BaseTradingStrategy
public synchronized void activate() {
    this.isActive = true;
}

// In TradingBotRunner
public synchronized void pauseBot() {
    paused = true;
}
```

### B. Synchronized Blocks
**Location:** `RSIStrategy.java`, `MovingAverageStrategy.java`

```java
public Order generateOrder(Double rsi, double currentPrice) {
    synchronized (this) {
        // Critical section protected by lock
        if (!isActive) {
            throw new TradingException("Strategy not active");
        }
        // Generate order
    }
}
```

### C. Wait/Notify Pattern: `OrderQueue`
**Location:** `backend/src/main/java/com/cryptotrading/thread/OrderQueue.java`

```java
public synchronized void addOrder(Order order) throws InterruptedException {
    while (orders.size() >= capacity) {
        wait(); // Wait for space
    }
    orders.add(order);
    notifyAll(); // Wake up consumers
}

public synchronized Order takeOrder() throws InterruptedException {
    while (orders.isEmpty()) {
        wait(); // Wait for orders
    }
    Order order = orders.poll();
    notifyAll(); // Wake up producers
    return order;
}
```

**Demonstrates:**
- Producer-Consumer pattern
- Thread coordination with wait/notify
- Preventing race conditions
- Deadlock avoidance

---

## 4. LOCKS

### A. ReentrantLock
**Location:** `BaseTradingStrategy.java`, `TradingBotRunner.java`

```java
private Lock strategyLock = new ReentrantLock();

public void activate() {
    strategyLock.lock();
    try {
        this.isActive = true;
    } finally {
        strategyLock.unlock();
    }
}
```

### B. ReadWriteLock
**Location:** `backend/src/main/java/com/cryptotrading/repository/GenericRepository.java`

```java
private ReadWriteLock lock = new ReentrantReadWriteLock();

public T findById(ID id) {
    lock.readLock().lock();
    try {
        return storage.get(id);
    } finally {
        lock.readLock().unlock();
    }
}

public void save(ID id, T entity) {
    lock.writeLock().lock();
    try {
        storage.put(id, entity);
    } finally {
        lock.writeLock().unlock();
    }
}
```

**Advantages:**
- More flexible than synchronized
- Explicit lock/unlock control
- ReadWriteLock allows multiple readers or single writer
- Better performance for read-heavy operations

---

## 5. GENERICS

### A. Generic Class: `BaseTradingStrategy<T>`
```java
public abstract class BaseTradingStrategy<T> {
    public abstract T analyzeMarket(Coin coin, List<Double> priceHistory);
    public abstract Order generateOrder(T analysis, double currentPrice);
}
```

**Usage:**
- `RSIStrategy extends BaseTradingStrategy<Double>`
- `MovingAverageStrategy extends BaseTradingStrategy<Map<String, Double>>`

### B. Generic Repository: `GenericRepository<T, ID>`
**Location:** `backend/src/main/java/com/cryptotrading/repository/GenericRepository.java`

```java
public class GenericRepository<T, ID> {
    private Map<ID, T> storage;
    
    public T findById(ID id) { ... }
    public void save(ID id, T entity) { ... }
    public List<T> findAll() { ... }
}
```

### C. Bounded Type Parameters
```java
public <V extends Comparable<V>> List<T> findByValue(V value) {
    // V must implement Comparable
    return new ArrayList<>(storage.values());
}
```

**Benefits:**
- Type safety at compile time
- Code reusability
- No need for type casting
- Works with any data type

---

## 6. EXCEPTION HANDLING

### Custom Exception: `TradingException`
**Location:** `backend/src/main/java/com/cryptotrading/exception/TradingException.java`

```java
public class TradingException extends Exception {
    private String errorCode;
    private String errorDetails;
    
    public TradingException(String message) {
        super(message);
    }
    
    public TradingException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public TradingException(String errorCode, String message, String errorDetails) {
        super(message);
        this.errorCode = errorCode;
        this.errorDetails = errorDetails;
    }
}
```

### Usage Examples:

#### A. Try-Catch with Custom Exception
**Location:** `RSIStrategy.java`

```java
@Override
public Double analyzeMarket(Coin coin, List<Double> priceHistory) {
    try {
        if (priceHistory == null || priceHistory.size() < period) {
            throw new TradingException("Insufficient price data");
        }
        return calculateRSI(priceHistory, period);
    } catch (TradingException e) {
        System.err.println("RSI calculation failed: " + e.getMessage());
        return 50.0; // Neutral RSI
    }
}
```

#### B. Try-Catch with Cause
**Location:** `MultiThreadDemoService.java`

```java
public String startBot(String botId, String strategyType, Coin coin) 
        throws TradingException {
    try {
        // Bot creation logic
        botThread.start();
        return "Bot started";
    } catch (TradingException e) {
        throw e; // Re-throw custom exception
    } catch (Exception e) {
        throw new TradingException("Failed to start bot", e); // Wrap generic exception
    }
}
```

#### C. Try-Catch in Controller
**Location:** `MultiThreadDemoController.java`

```java
@PostMapping("/bot/start")
public ResponseEntity<?> startBot(@RequestBody Map<String, Object> request) {
    try {
        String result = demoService.startBot(botId, strategy, coin);
        return ResponseEntity.ok(response);
    } catch (TradingException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "Internal error"));
    }
}
```

**Demonstrates:**
- Custom exception classes
- Exception chaining (cause)
- Multiple catch blocks
- Finally blocks for cleanup
- Re-throwing exceptions
- Exception propagation

---

## Testing the Implementation

### REST API Endpoints

All endpoints are available at `http://localhost:8080/api/demo`

#### 1. Start a Trading Bot
```bash
POST /api/demo/bot/start
Content-Type: application/json

{
  "botId": "bot-1",
  "strategy": "RSI",
  "coinId": "bitcoin",
  "symbol": "BTC",
  "price": 50000.0
}
```

#### 2. Stop a Bot
```bash
POST /api/demo/bot/stop/bot-1
```

#### 3. Pause a Bot
```bash
POST /api/demo/bot/pause/bot-1
```

#### 4. Resume a Bot
```bash
POST /api/demo/bot/resume/bot-1
```

#### 5. Get Bot Status
```bash
GET /api/demo/bot/status/bot-1
```

#### 6. Get All Active Bots
```bash
GET /api/demo/bot/active
```

#### 7. View OOP Concepts
```bash
GET /api/demo/concepts
```

---

## File Structure

```
backend/src/main/java/com/cryptotrading/
├── controller/
│   └── MultiThreadDemoController.java    # REST endpoints for bot control
├── service/
│   └── MultiThreadDemoService.java       # Service layer with bot management
├── strategy/
│   ├── BaseTradingStrategy.java          # Abstract base (Inheritance + Generics)
│   ├── RSIStrategy.java                  # RSI implementation (Inheritance)
│   └── MovingAverageStrategy.java        # MA implementation (Inheritance)
├── thread/
│   ├── TradingBotRunner.java             # Thread extension (Multi-Threading)
│   ├── OrderProcessor.java               # Runnable implementation
│   └── OrderQueue.java                   # Producer-Consumer (Synchronization)
├── repository/
│   └── GenericRepository.java            # Generic repository (Generics + Locks)
└── exception/
    └── TradingException.java             # Custom exception (Exception Handling)
```

---

## Summary

| Concept | Files | Key Features |
|---------|-------|--------------|
| **Inheritance** | BaseTradingStrategy, RSIStrategy, MovingAverageStrategy | Abstract classes, method overriding, polymorphism |
| **Multi-Threading** | TradingBotRunner, OrderProcessor | Thread.start(), stop(), sleep(), extends Thread, implements Runnable |
| **Synchronization** | OrderQueue, strategy classes | synchronized methods, synchronized blocks, wait/notify |
| **Locks** | BaseTradingStrategy, GenericRepository | ReentrantLock, ReadWriteLock, lock/unlock |
| **Generics** | BaseTradingStrategy<T>, GenericRepository<T, ID> | Type parameters, bounded types, type safety |
| **Exception Handling** | TradingException, all classes | Custom exceptions, try-catch-finally, exception chaining |

All concepts are working together in a real-world trading bot scenario!
