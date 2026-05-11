package com.cryptotrading.strategy;

import com.cryptotrading.exception.TradingException;
import com.cryptotrading.model.Coin;
import com.cryptotrading.model.Order;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Moving Average Strategy - Another example of INHERITANCE
 * Uses GENERICS with Map type for analysis results
 */
public class MovingAverageStrategy extends BaseTradingStrategy<Map<String, Double>> {
    private int shortPeriod;
    private int longPeriod;
    
    public MovingAverageStrategy(int shortPeriod, int longPeriod) {
        super("Moving Average Strategy");
        this.shortPeriod = shortPeriod;
        this.longPeriod = longPeriod;
    }
    
    @Override
    public Map<String, Double> analyzeMarket(Coin coin, List<Double> priceHistory) {
        Map<String, Double> analysis = new HashMap<>();
        
        try {
            if (priceHistory == null || priceHistory.size() < longPeriod) {
                throw new TradingException("Insufficient data for MA calculation");
            }
            
            double shortMA = calculateMA(priceHistory, shortPeriod);
            double longMA = calculateMA(priceHistory, longPeriod);
            
            analysis.put("shortMA", shortMA);
            analysis.put("longMA", longMA);
            analysis.put("signal", shortMA > longMA ? 1.0 : -1.0);
            
            System.out.println("MA Analysis - Short: " + shortMA + ", Long: " + longMA);
            
        } catch (TradingException e) {
            System.err.println("MA calculation error: " + e.getMessage());
            analysis.put("signal", 0.0);
        }
        
        return analysis;
    }
    
    @Override
    public Order generateOrder(Map<String, Double> analysis, double currentPrice) {
        synchronized (this) {
            try {
                if (!isActive) {
                    throw new TradingException("Strategy not active");
                }
                
                double signal = analysis.getOrDefault("signal", 0.0);
                
                if (Math.abs(signal) < 0.1) {
                    return null;
                }
                
                Order order = new Order();
                order.setPrice(new java.math.BigDecimal(currentPrice));
                order.setQuantity(new java.math.BigDecimal("0.01"));
                order.setStatus(Order.OrderStatus.PENDING);
                
                if (signal > 0) {
                    order.setType(Order.OrderType.BUY);
                    System.out.println("MA Buy signal - Golden cross detected");
                } else {
                    order.setType(Order.OrderType.SELL);
                    System.out.println("MA Sell signal - Death cross detected");
                }
                
                return order;
                
            } catch (TradingException e) {
                System.err.println("Order generation failed: " + e.getMessage());
                return null;
            }
        }
    }
    
    private double calculateMA(List<Double> prices, int period) {
        int start = Math.max(0, prices.size() - period);
        double sum = 0;
        
        for (int i = start; i < prices.size(); i++) {
            sum += prices.get(i);
        }
        
        return sum / period;
    }
}
