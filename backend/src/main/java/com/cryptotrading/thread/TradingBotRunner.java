package com.cryptotrading.thread;

import com.cryptotrading.model.Coin;
import com.cryptotrading.model.Order;
import com.cryptotrading.service.OrderExecutionService;
import com.cryptotrading.strategy.BaseTradingStrategy;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Demonstrates MULTI-THREADING with start, stop, and sleep
 * Also shows SYNCHRONIZATION and LOCKS
 */
public class TradingBotRunner extends Thread {
    private BaseTradingStrategy<?> strategy;
    private Coin coin;
    private final String botId;
    private final OrderExecutionService orderExecutionService;
    private volatile boolean running;
    private volatile boolean paused;
    private Lock executionLock;
    private List<Order> executedOrders;
    private int executionInterval;
    
    public TradingBotRunner(BaseTradingStrategy<?> strategy,
                            Coin coin,
                            int intervalSeconds,
                            String botId,
                            OrderExecutionService orderExecutionService) {
        this.strategy = strategy;
        this.coin = coin;
        this.botId = botId;
        this.orderExecutionService = orderExecutionService;
        this.running = false;
        this.paused = false;
        this.executionLock = new ReentrantLock();
        this.executedOrders = new ArrayList<>();
        this.executionInterval = intervalSeconds * 1000;
        
        // Set thread name for better debugging
        setName("TradingBot-" + coin.getSymbol() + "-" + strategy.getClass().getSimpleName());
    }
    
    /**
     * MULTI-THREADING: Thread execution method
     */
    @Override
    public void run() {
        System.out.println(getName() + " started");
        running = true;
        strategy.activate();
        
        while (running) {
            try {
                // Check if paused
                synchronized (this) {
                    while (paused) {
                        System.out.println(getName() + " is paused");
                        wait(); // Thread waits until notified
                    }
                }
                
                // Execute trading logic with LOCK
                executeTradingCycle();
                
                // MULTI-THREADING: Thread.sleep() demonstration
                Thread.sleep(executionInterval);
                
            } catch (InterruptedException e) {
                System.out.println(getName() + " interrupted");
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                System.err.println(getName() + " error: " + e.getMessage());
            }
        }
        
        strategy.deactivate();
        System.out.println(getName() + " stopped");
    }
    
    /**
     * SYNCHRONIZATION and LOCKS demonstration
     */
    private void executeTradingCycle() {
        executionLock.lock();
        try {
            // Simulate getting price history
            List<Double> priceHistory = generateMockPriceHistory();
            
            // Analyze market using strategy
            Object analysis = strategy.analyzeMarket(coin, priceHistory);
            
            // Get current price
            double currentPrice = priceHistory.get(priceHistory.size() - 1);
            
            // Generate order using reflection to handle generic types
            Order order = null;
            try {
                java.lang.reflect.Method generateMethod = strategy.getClass().getMethod("generateOrder", Object.class, double.class);
                order = (Order) generateMethod.invoke(strategy, analysis, currentPrice);
            } catch (Exception e) {
                System.err.println("Error calling generateOrder: " + e.getMessage());
            }
            
            if (order != null) {
                // Ensure required fields are present before sending to execution service
                order.setSymbol(coin.getSymbol() != null ? coin.getSymbol().toUpperCase() : "BTC");
                order.setBotId(botId);
                order.setStrategyId(strategy.getStrategyName());

                try {
                    var executed = orderExecutionService.createOrder(
                        order.getSymbol(),
                        order.getType().name(),
                        order.getQuantity().doubleValue(),
                        order.getPrice().doubleValue()
                    );

                    synchronized (executedOrders) {
                        executedOrders.add(executed);
                        System.out.println(getName() + " executed order: " +
                            executed.getType() + " at " + executed.getPrice());
                    }
                } catch (Exception execEx) {
                    System.err.println(getName() + " failed to execute order: " + execEx.getMessage());
                }
            }
            
        } catch (Exception e) {
            System.err.println("Trading cycle failed: " + e.getMessage());
        } finally {
            executionLock.unlock();
        }
    }
    
    /**
     * MULTI-THREADING: Stop method demonstration
     */
    public void stopBot() {
        System.out.println("Stopping " + getName());
        running = false;
        interrupt(); // Interrupt if sleeping
    }
    
    /**
     * SYNCHRONIZATION: Pause/Resume methods
     */
    public synchronized void pauseBot() {
        System.out.println("Pausing " + getName());
        paused = true;
    }
    
    public synchronized void resumeBot() {
        System.out.println("Resuming " + getName());
        paused = false;
        notify(); // Wake up the thread
    }
    
    /**
     * SYNCHRONIZATION: Thread-safe getter
     */
    public synchronized List<Order> getExecutedOrders() {
        synchronized (executedOrders) {
            return new ArrayList<>(executedOrders);
        }
    }
    
    public synchronized boolean isRunning() {
        return running;
    }
    
    public synchronized boolean isPaused() {
        return paused;
    }
    
    /**
     * Mock method to simulate price history
     */
    private List<Double> generateMockPriceHistory() {
        List<Double> history = new ArrayList<>();
        java.math.BigDecimal basePrice = coin.getCurrentPrice();
        double basePriceDouble = basePrice.doubleValue();
        
        for (int i = 0; i < 20; i++) {
            double variation = (Math.random() - 0.5) * basePriceDouble * 0.02;
            history.add(basePriceDouble + variation);
        }
        
        return history;
    }
}
