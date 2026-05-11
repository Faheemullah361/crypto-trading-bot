package com.cryptotrading.service;

import com.cryptotrading.exception.TradingException;
import com.cryptotrading.model.Coin;
import com.cryptotrading.model.Order;
import com.cryptotrading.strategy.BaseTradingStrategy;
import com.cryptotrading.strategy.RSIStrategy;
import com.cryptotrading.strategy.MovingAverageStrategy;
import com.cryptotrading.strategy.ManualStrategy;
import com.cryptotrading.thread.TradingBotRunner;
import com.cryptotrading.thread.OrderQueue;
import com.cryptotrading.thread.OrderProcessor;
import com.cryptotrading.service.OrderExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Multi-Threading Demo Service
 * Demonstrates all OOP concepts: Inheritance, Multi-Threading, Synchronization, 
 * Locks, Generics, and Exception Handling
 */
@Service
public class MultiThreadDemoService {
    private Map<String, TradingBotRunner> activeBots;
    private Map<String, Thread> botThreads;
    private Map<String, String> botStrategies; // Store strategy types
    private Map<String, String> botStrategyNames; // Store strategy names
    private OrderQueue orderQueue;
    private OrderProcessor orderProcessor;
    private Thread processorThread;
    private Lock serviceLock;
    @Autowired
    private OrderExecutionService orderExecutionService;
    
    public MultiThreadDemoService() {
        this.activeBots = new HashMap<>();
        this.botThreads = new HashMap<>();
        this.botStrategies = new HashMap<>();
        this.botStrategyNames = new HashMap<>();
        this.orderQueue = new OrderQueue(50);
        this.orderProcessor = new OrderProcessor(orderQueue, "OrderProcessor-1");
        this.serviceLock = new ReentrantLock();
    }
    
    /**
     * MULTI-THREADING: Start a trading bot with specific strategy
     * EXCEPTION HANDLING: Throws custom exception
     */
    public synchronized String startBot(String botId, String strategyType, Coin coin) 
            throws TradingException {
        return startBot(botId, strategyType, coin, null);
    }
    
    /**
     * MULTI-THREADING: Start a trading bot with specific strategy and optional parameters
     * EXCEPTION HANDLING: Throws custom exception
     */
    public synchronized String startBot(String botId, String strategyType, Coin coin, Map<String, Object> params) 
            throws TradingException {
        serviceLock.lock();
        try {
            if (activeBots.containsKey(botId)) {
                throw new TradingException("BOT_EXISTS", 
                    "Bot already running", 
                    "Bot ID: " + botId);
            }
            
            // INHERITANCE: Create strategy based on type
            BaseTradingStrategy<?> strategy;
            if ("RSI".equalsIgnoreCase(strategyType)) {
                strategy = new RSIStrategy(14, 30, 70);
            } else if ("MA".equalsIgnoreCase(strategyType)) {
                strategy = new MovingAverageStrategy(20, 50);
            } else if ("MANUAL".equalsIgnoreCase(strategyType)) {
                // Manual strategy - use custom values if provided, otherwise defaults
                double currentPrice = coin.getCurrentPrice().doubleValue();
                double buyThreshold = currentPrice * 0.95;  // Default: Buy when price drops 5%
                double sellThreshold = currentPrice * 1.05; // Default: Sell when price rises 5%
                double buyPercentageChange = -5.0; // Default: -5%
                double sellPercentageChange = 5.0; // Default: +5%
                
                if (params != null) {
                    if (params.containsKey("buyPrice")) {
                        buyThreshold = ((Number) params.get("buyPrice")).doubleValue();
                    }
                    if (params.containsKey("sellPrice")) {
                        sellThreshold = ((Number) params.get("sellPrice")).doubleValue();
                    }
                    if (params.containsKey("buyPercentage")) {
                        buyPercentageChange = ((Number) params.get("buyPercentage")).doubleValue();
                    }
                    if (params.containsKey("sellPercentage")) {
                        sellPercentageChange = ((Number) params.get("sellPercentage")).doubleValue();
                    }
                }
                
                strategy = new ManualStrategy(buyThreshold, sellThreshold, buyPercentageChange, sellPercentageChange);
            } else {
                throw new TradingException("INVALID_STRATEGY", 
                    "Unknown strategy type", 
                    "Type: " + strategyType);
            }
            
            // MULTI-THREADING: Create and start bot thread
            TradingBotRunner bot = new TradingBotRunner(strategy, coin, 5, botId, orderExecutionService);
            Thread botThread = new Thread(bot);
            
            activeBots.put(botId, bot);
            botThreads.put(botId, botThread);
            botStrategies.put(botId, strategyType);
            
            // Store strategy name if provided in params
            if (params != null && params.containsKey("strategyName")) {
                botStrategyNames.put(botId, (String) params.get("strategyName"));
            }
            
            botThread.start(); // MULTI-THREADING: Thread.start()
            
            // Start order processor if not running
            startOrderProcessor();
            
            return "Bot " + botId + " started with " + strategyType + " strategy";
            
        } catch (TradingException e) {
            throw e;
        } catch (Exception e) {
            throw new TradingException("Failed to start bot", e);
        } finally {
            serviceLock.unlock();
        }
    }
    
    /**
     * MULTI-THREADING: Stop a trading bot
     */
    public synchronized String stopBot(String botId) throws TradingException {
        serviceLock.lock();
        try {
            TradingBotRunner bot = activeBots.get(botId);
            if (bot == null) {
                throw new TradingException("BOT_NOT_FOUND", 
                    "Bot not found", 
                    "Bot ID: " + botId);
            }
            
            bot.stopBot(); // MULTI-THREADING: Stop the bot
            activeBots.remove(botId);
            botThreads.remove(botId);
            botStrategies.remove(botId);
            botStrategyNames.remove(botId);
            
            return "Bot " + botId + " stopped";
            
        } finally {
            serviceLock.unlock();
        }
    }
    
    /**
     * SYNCHRONIZATION: Pause/Resume bot operations
     */
    public synchronized String pauseBot(String botId) throws TradingException {
        TradingBotRunner bot = activeBots.get(botId);
        if (bot == null) {
            throw new TradingException("Bot not found: " + botId);
        }
        bot.pauseBot();
        return "Bot " + botId + " paused";
    }
    
    public synchronized String resumeBot(String botId) throws TradingException {
        TradingBotRunner bot = activeBots.get(botId);
        if (bot == null) {
            throw new TradingException("Bot not found: " + botId);
        }
        bot.resumeBot();
        return "Bot " + botId + " resumed";
    }
    
    /**
     * MULTI-THREADING: Start order processor thread
     */
    private void startOrderProcessor() {
        if (processorThread == null || !processorThread.isAlive()) {
            processorThread = new Thread(orderProcessor);
            processorThread.start(); // MULTI-THREADING: Thread.start()
            System.out.println("Order processor started");
        }
    }
    
    /**
     * Get bot status with SYNCHRONIZATION
     */
    public synchronized Map<String, Object> getBotStatus(String botId) throws TradingException {
        TradingBotRunner bot = activeBots.get(botId);
        if (bot == null) {
            throw new TradingException("Bot not found: " + botId);
        }
        
        Map<String, Object> status = new HashMap<>();
        status.put("botId", botId);
        status.put("running", bot.isRunning());
        status.put("paused", bot.isPaused());
        status.put("executedOrders", bot.getExecutedOrders().size());
        
        // Add strategy information
        if (botStrategies.containsKey(botId)) {
            status.put("strategyType", botStrategies.get(botId));
        }
        if (botStrategyNames.containsKey(botId)) {
            status.put("strategyName", botStrategyNames.get(botId));
        }
        
        return status;
    }
    
    /**
     * Get all active bots
     */
    public synchronized List<String> getActiveBots() {
        return List.copyOf(activeBots.keySet());
    }
    
    /**
     * MULTI-THREADING: Stop all bots and cleanup
     */
    public synchronized void stopAll() {
        System.out.println("Stopping all bots and processors...");
        
        for (TradingBotRunner bot : activeBots.values()) {
            bot.stopBot();
        }
        
        if (orderProcessor != null) {
            orderProcessor.stop();
        }
        
        activeBots.clear();
        botThreads.clear();
        
        System.out.println("All bots stopped");
    }
}
