package com.cryptotrading.model;

public class StrategyPerformance {
    private int totalTrades;
    private int winningTrades;
    private int losingTrades;
    private double winRate;
    private double totalPnL;
    private double maxDrawdown;
    private double profitFactor;

    public int getTotalTrades() { return totalTrades; }
    public void setTotalTrades(int totalTrades) { this.totalTrades = totalTrades; }

    public int getWinningTrades() { return winningTrades; }
    public void setWinningTrades(int winningTrades) { this.winningTrades = winningTrades; }

    public int getLosingTrades() { return losingTrades; }
    public void setLosingTrades(int losingTrades) { this.losingTrades = losingTrades; }

    public double getWinRate() { return winRate; }
    public void setWinRate(double winRate) { this.winRate = winRate; }

    public double getTotalPnL() { return totalPnL; }
    public void setTotalPnL(double totalPnL) { this.totalPnL = totalPnL; }

    public double getMaxDrawdown() { return maxDrawdown; }
    public void setMaxDrawdown(double maxDrawdown) { this.maxDrawdown = maxDrawdown; }

    public double getProfitFactor() { return profitFactor; }
    public void setProfitFactor(double profitFactor) { this.profitFactor = profitFactor; }
}
