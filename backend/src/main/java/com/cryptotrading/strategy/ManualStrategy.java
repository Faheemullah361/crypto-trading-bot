package com.cryptotrading.strategy;

import com.cryptotrading.exception.TradingException;
import com.cryptotrading.model.Coin;
import com.cryptotrading.model.Order;

import java.util.List;
import java.math.BigDecimal;

/**
 * Manual Strategy - Allows users to manually set buy/sell conditions
 * Extends INHERITANCE from BaseTradingStrategy with GENERICS
 */
public class ManualStrategy extends BaseTradingStrategy<ManualStrategy.ManualSignal> {
    
    public static class ManualSignal {
        public enum SignalType {
            NO_SIGNAL, BUY_SIGNAL, SELL_SIGNAL
        }
        
        private SignalType type;
        private String condition;
        private double targetPrice;
        private double currentPrice;
        
        public ManualSignal(SignalType type, String condition, double targetPrice, double currentPrice) {
            this.type = type;
            this.condition = condition;
            this.targetPrice = targetPrice;
            this.currentPrice = currentPrice;
        }
        
        public SignalType getType() { return type; }
        public String getCondition() { return condition; }
        public double getTargetPrice() { return targetPrice; }
        public double getCurrentPrice() { return currentPrice; }
    }
    
    private double buyPriceThreshold;
    private double sellPriceThreshold;
    private double buyPercentageChange;
    private double sellPercentageChange;
    private boolean usePriceThreshold;
    private boolean usePercentageChange;
    private Double baselinePrice;
    
    /**
     * Constructor for Manual Strategy
     * @param buyPriceThreshold Price at which to buy
     * @param sellPriceThreshold Price at which to sell
     * @param buyPercentageChange Percentage drop from baseline to trigger buy
     * @param sellPercentageChange Percentage rise from baseline to trigger sell
     */
    public ManualStrategy(double buyPriceThreshold, double sellPriceThreshold, 
                         double buyPercentageChange, double sellPercentageChange) {
        super("Manual Strategy");
        this.buyPriceThreshold = buyPriceThreshold;
        this.sellPriceThreshold = sellPriceThreshold;
        this.buyPercentageChange = buyPercentageChange;
        this.sellPercentageChange = sellPercentageChange;
        this.usePriceThreshold = buyPriceThreshold > 0 || sellPriceThreshold > 0;
        this.usePercentageChange = buyPercentageChange != 0 || sellPercentageChange != 0;
        this.baselinePrice = null;
    }
    
    @Override
    public ManualSignal analyzeMarket(Coin coin, List<Double> priceHistory) {
        try {
            if (priceHistory == null || priceHistory.isEmpty()) {
                throw new TradingException("No price data available");
            }
            
            double currentPrice = priceHistory.get(priceHistory.size() - 1);
            
            // Set baseline price if not set (first time)
            if (baselinePrice == null && priceHistory.size() > 1) {
                baselinePrice = priceHistory.get(0);
            }
            
            // Check price threshold conditions
            if (usePriceThreshold) {
                if (buyPriceThreshold > 0 && currentPrice <= buyPriceThreshold) {
                    return new ManualSignal(
                        ManualSignal.SignalType.BUY_SIGNAL,
                        "Price dropped to " + currentPrice + " (threshold: " + buyPriceThreshold + ")",
                        buyPriceThreshold,
                        currentPrice
                    );
                }
                
                if (sellPriceThreshold > 0 && currentPrice >= sellPriceThreshold) {
                    return new ManualSignal(
                        ManualSignal.SignalType.SELL_SIGNAL,
                        "Price reached " + currentPrice + " (threshold: " + sellPriceThreshold + ")",
                        sellPriceThreshold,
                        currentPrice
                    );
                }
            }
            
            // Check percentage change conditions
            if (usePercentageChange && baselinePrice != null) {
                double percentageChange = ((currentPrice - baselinePrice) / baselinePrice) * 100;
                
                if (buyPercentageChange != 0 && percentageChange <= -Math.abs(buyPercentageChange)) {
                    return new ManualSignal(
                        ManualSignal.SignalType.BUY_SIGNAL,
                        "Price dropped " + Math.abs(percentageChange) + "% from baseline",
                        baselinePrice * (1 - Math.abs(buyPercentageChange) / 100),
                        currentPrice
                    );
                }
                
                if (sellPercentageChange != 0 && percentageChange >= Math.abs(sellPercentageChange)) {
                    return new ManualSignal(
                        ManualSignal.SignalType.SELL_SIGNAL,
                        "Price increased " + percentageChange + "% from baseline",
                        baselinePrice * (1 + Math.abs(sellPercentageChange) / 100),
                        currentPrice
                    );
                }
            }
            
            return new ManualSignal(ManualSignal.SignalType.NO_SIGNAL, "No conditions met", 0, currentPrice);
            
        } catch (TradingException e) {
            System.err.println("Manual strategy analysis failed: " + e.getMessage());
            return new ManualSignal(ManualSignal.SignalType.NO_SIGNAL, "Error: " + e.getMessage(), 0, 0);
        }
    }
    
    @Override
    public Order generateOrder(ManualSignal signal, double currentPrice) {
        synchronized (this) {
            try {
                if (!isActive) {
                    throw new TradingException("Strategy not active");
                }
                
                if (signal.getType() == ManualSignal.SignalType.NO_SIGNAL) {
                    return null;
                }
                
                Order order = new Order();
                order.setPrice(new BigDecimal(currentPrice));
                order.setQuantity(new BigDecimal("0.01"));
                order.setStatus(Order.OrderStatus.PENDING);
                
                if (signal.getType() == ManualSignal.SignalType.BUY_SIGNAL) {
                    order.setType(Order.OrderType.BUY);
                    System.out.println("Manual Buy signal - " + signal.getCondition());
                } else if (signal.getType() == ManualSignal.SignalType.SELL_SIGNAL) {
                    order.setType(Order.OrderType.SELL);
                    System.out.println("Manual Sell signal - " + signal.getCondition());
                }
                
                return order;
                
            } catch (TradingException e) {
                System.err.println("Order generation failed: " + e.getMessage());
                return null;
            }
        }
    }
    
    // Getters and Setters
    public double getBuyPriceThreshold() { return buyPriceThreshold; }
    public void setBuyPriceThreshold(double buyPriceThreshold) { 
        this.buyPriceThreshold = buyPriceThreshold;
        this.usePriceThreshold = buyPriceThreshold > 0 || sellPriceThreshold > 0;
    }
    
    public double getSellPriceThreshold() { return sellPriceThreshold; }
    public void setSellPriceThreshold(double sellPriceThreshold) { 
        this.sellPriceThreshold = sellPriceThreshold;
        this.usePriceThreshold = buyPriceThreshold > 0 || sellPriceThreshold > 0;
    }
    
    public double getBuyPercentageChange() { return buyPercentageChange; }
    public void setBuyPercentageChange(double buyPercentageChange) { 
        this.buyPercentageChange = buyPercentageChange;
        this.usePercentageChange = buyPercentageChange != 0 || sellPercentageChange != 0;
    }
    
    public double getSellPercentageChange() { return sellPercentageChange; }
    public void setSellPercentageChange(double sellPercentageChange) { 
        this.sellPercentageChange = sellPercentageChange;
        this.usePercentageChange = buyPercentageChange != 0 || sellPercentageChange != 0;
    }
    
    public void setBaselinePrice(double baselinePrice) {
        this.baselinePrice = baselinePrice;
    }
    
    public Double getBaselinePrice() {
        return baselinePrice;
    }
}
