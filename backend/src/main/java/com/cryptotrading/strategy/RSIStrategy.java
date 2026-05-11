package com.cryptotrading.strategy;

import com.cryptotrading.exception.TradingException;
import com.cryptotrading.model.Coin;
import com.cryptotrading.model.Order;

import java.util.List;

/**
 * RSI Strategy - Relative Strength Index
 * Extends INHERITANCE from BaseTradingStrategy with GENERICS
 */
public class RSIStrategy extends BaseTradingStrategy<Double> {
    private int period;
    private double lowerBound; // Oversold threshold
    private double upperBound; // Overbought threshold
    private double threshold;
    
    public RSIStrategy(int period, double lowerBound, double upperBound) {
        super("RSI Strategy");
        this.period = period;
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
        this.threshold = 2.0;
    }
    
    @Override
    public Double analyzeMarket(Coin coin, List<Double> priceHistory) {
        try {
            if (priceHistory == null || priceHistory.size() < period) {
                throw new TradingException("Insufficient price data for RSI calculation");
            }
            
            return calculateRSI(priceHistory, period);
            
        } catch (TradingException e) {
            System.err.println("RSI analysis failed: " + e.getMessage());
            return 50.0; // Neutral RSI
        }
    }
    
    @Override
    public Order generateOrder(Double rsi, double currentPrice) {
        synchronized (this) {
            try {
                if (!isActive) {
                    throw new TradingException("Strategy not active");
                }
                
                if (Math.abs(rsi - 50) < threshold) {
                    return null; // No signal
                }
                
                Order order = new Order();
                order.setPrice(new java.math.BigDecimal(currentPrice));
                order.setQuantity(new java.math.BigDecimal("0.01"));
                order.setStatus(Order.OrderStatus.PENDING);
                
                if (rsi < lowerBound) {
                    order.setType(Order.OrderType.BUY);
                    System.out.println("RSI Buy signal - Oversold at " + rsi);
                } else if (rsi > upperBound) {
                    order.setType(Order.OrderType.SELL);
                    System.out.println("RSI Sell signal - Overbought at " + rsi);
                } else {
                    return null;
                }
                
                return order;
                
            } catch (TradingException e) {
                System.err.println("Order generation failed: " + e.getMessage());
                return null;
            }
        }
    }
    
    private double calculateRSI(List<Double> prices, int period) {
        if (prices.size() < period) {
            return 50.0;
        }
        
        double gain = 0;
        double loss = 0;
        
        for (int i = prices.size() - period; i < prices.size(); i++) {
            double change = prices.get(i) - prices.get(i - 1);
            if (change > 0) {
                gain += change;
            } else {
                loss -= change;
            }
        }
        
        double avgGain = gain / period;
        double avgLoss = loss / period;
        
        if (avgLoss == 0) {
            return avgGain == 0 ? 50.0 : 100.0;
        }
        
        double rs = avgGain / avgLoss;
        return 100.0 - (100.0 / (1.0 + rs));
    }
}
