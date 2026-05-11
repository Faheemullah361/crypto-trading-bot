package com.cryptotrading.controller;

import com.cryptotrading.exception.TradingException;
import com.cryptotrading.model.Coin;
import com.cryptotrading.service.MultiThreadDemoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller to demonstrate Multi-Threading capabilities
 * Start/Stop/Pause trading bots with different strategies
 */
@RestController
@RequestMapping("/api/demo")
@CrossOrigin(origins = "*")
public class MultiThreadDemoController {
    
    @Autowired
    private MultiThreadDemoService demoService;
    
    /**
     * Start a new trading bot
     * EXCEPTION HANDLING: Try-catch with custom exception
     */
    @PostMapping("/bot/start")
    public ResponseEntity<?> startBot(@RequestBody Map<String, Object> request) {
        try {
            String botId = (String) request.get("botId");
            String strategy = (String) request.get("strategy");
            
            // Create mock coin
            Coin coin = new Coin();
            coin.setId(1L); // Use default ID
            coin.setSymbol((String) request.getOrDefault("symbol", "BTC"));
            Double price = ((Number) request.getOrDefault("price", 50000.0)).doubleValue();
            coin.setCurrentPrice(new BigDecimal(price.toString()));
            
            // Extract manual strategy parameters if provided
            Map<String, Object> manualParams = null;
            if ("MANUAL".equalsIgnoreCase(strategy) && request.containsKey("manualParams")) {
                manualParams = (Map<String, Object>) request.get("manualParams");
            }
            
            // Extract strategy name if provided (from StrategyManager)
            if (request.containsKey("strategyName")) {
                if (manualParams == null) {
                    manualParams = new HashMap<>();
                }
                manualParams.put("strategyName", request.get("strategyName"));
            }
            
            // Extract strategy parameters if provided
            if (request.containsKey("parameters")) {
                if (manualParams == null) {
                    manualParams = new HashMap<>();
                }
                Map<String, Object> params = (Map<String, Object>) request.get("parameters");
                manualParams.putAll(params);
            }
            
            String result = demoService.startBot(botId, strategy, coin, manualParams);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", result);
            response.put("botId", botId);
            
            return ResponseEntity.ok(response);
            
        } catch (TradingException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Internal error: " + e.getMessage()));
        }
    }
    
    /**
     * Stop a trading bot
     */
    @PostMapping("/bot/stop/{botId}")
    public ResponseEntity<?> stopBot(@PathVariable String botId) {
        try {
            String result = demoService.stopBot(botId);
            return ResponseEntity.ok(Map.of("success", true, "message", result));
        } catch (TradingException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * Pause a trading bot
     */
    @PostMapping("/bot/pause/{botId}")
    public ResponseEntity<?> pauseBot(@PathVariable String botId) {
        try {
            String result = demoService.pauseBot(botId);
            return ResponseEntity.ok(Map.of("success", true, "message", result));
        } catch (TradingException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * Resume a trading bot
     */
    @PostMapping("/bot/resume/{botId}")
    public ResponseEntity<?> resumeBot(@PathVariable String botId) {
        try {
            String result = demoService.resumeBot(botId);
            return ResponseEntity.ok(Map.of("success", true, "message", result));
        } catch (TradingException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * Get bot status
     */
    @GetMapping("/bot/status/{botId}")
    public ResponseEntity<?> getBotStatus(@PathVariable String botId) {
        try {
            Map<String, Object> status = demoService.getBotStatus(botId);
            return ResponseEntity.ok(status);
        } catch (TradingException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * Get all active bots
     */
    @GetMapping("/bot/active")
    public ResponseEntity<Map<String, Object>> getActiveBots() {
        List<String> activeBots = demoService.getActiveBots();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("activeBots", activeBots);
        response.put("count", activeBots.size());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Stop all bots
     */
    @PostMapping("/bot/stop-all")
    public ResponseEntity<Map<String, Object>> stopAllBots() {
        demoService.stopAll();
        return ResponseEntity.ok(Map.of("success", true, "message", "All bots stopped"));
    }
    
    /**
     * Demo endpoint to test all OOP concepts
     */
    @GetMapping("/concepts")
    public ResponseEntity<Map<String, Object>> getOOPConcepts() {
        Map<String, Object> concepts = new HashMap<>();
        
        concepts.put("inheritance", "BaseTradingStrategy -> RSIStrategy, MovingAverageStrategy");
        concepts.put("multiThreading", "TradingBotRunner extends Thread with start/stop/sleep");
        concepts.put("synchronization", "OrderQueue with wait/notify, synchronized methods");
        concepts.put("locks", "ReentrantLock, ReadWriteLock in GenericRepository");
        concepts.put("generics", "BaseTradingStrategy<T>, GenericRepository<T, ID>");
        concepts.put("exceptionHandling", "TradingException with custom error codes");
        
        return ResponseEntity.ok(concepts);
    }
}
