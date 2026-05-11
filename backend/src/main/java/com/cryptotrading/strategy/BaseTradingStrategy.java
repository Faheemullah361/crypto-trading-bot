package com.cryptotrading.strategy;

import com.cryptotrading.model.Coin;
import com.cryptotrading.model.Order;

import java.util.List;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Base class for all trading strategies - Demonstrates INHERITANCE
 * All strategies must extend this class
 */
public abstract class BaseTradingStrategy<T> {
    protected String strategyName;
    protected boolean isActive;
    protected Lock strategyLock = new ReentrantLock(); // Demonstrates LOCKS
    
    public BaseTradingStrategy(String strategyName) {
        this.strategyName = strategyName;
        this.isActive = false;
    }
    
    // Abstract methods to be implemented by child classes
    public abstract T analyzeMarket(Coin coin, List<Double> priceHistory);
    
    public abstract Order generateOrder(T analysis, double currentPrice);
    
    // Common method with LOCK demonstration
    public synchronized void activate() {
        strategyLock.lock();
        try {
            this.isActive = true;
            System.out.println(strategyName + " strategy activated with lock protection");
        } finally {
            strategyLock.unlock();
        }
    }
    
    public synchronized void deactivate() {
        strategyLock.lock();
        try {
            this.isActive = false;
            System.out.println(strategyName + " strategy deactivated");
        } finally {
            strategyLock.unlock();
        }
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public String getStrategyName() {
        return strategyName;
    }
}
