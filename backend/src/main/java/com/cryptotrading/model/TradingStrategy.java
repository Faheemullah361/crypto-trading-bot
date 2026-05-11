package com.cryptotrading.model;

public class TradingStrategy {
    private String name;
    private String description;
    private double buyThreshold;
    private double sellThreshold;

    public TradingStrategy(String name, String description, double buyThreshold, double sellThreshold) {
        this.name = name;
        this.description = description;
        this.buyThreshold = buyThreshold;
        this.sellThreshold = sellThreshold;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getBuyThreshold() {
        return buyThreshold;
    }

    public void setBuyThreshold(double buyThreshold) {
        this.buyThreshold = buyThreshold;
    }

    public double getSellThreshold() {
        return sellThreshold;
    }

    public void setSellThreshold(double sellThreshold) {
        this.sellThreshold = sellThreshold;
    }

    public boolean shouldBuy(double currentPrice) {
        return currentPrice <= buyThreshold;
    }

    public boolean shouldSell(double currentPrice) {
        return currentPrice >= sellThreshold;
    }
}