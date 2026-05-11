package com.cryptotrading.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TradingBotService {
    private final CoinDataService coinDataService;
    private final OrderExecutionService orderExecutionService;
    private final Map<String, Boolean> activeBots = new ConcurrentHashMap<>();
    private final List<String> logs = Collections.synchronizedList(new ArrayList<>());

    public TradingBotService(CoinDataService coinDataService, OrderExecutionService orderExecutionService) {
        this.coinDataService = coinDataService;
        this.orderExecutionService = orderExecutionService;
    }

    public void startTradingBot(String symbol) {
        activeBots.put(symbol, true);
        addLog("Bot started for " + symbol);
    }

    public void stopTradingBot(String symbol) {
        activeBots.put(symbol, false);
        addLog("Bot stopped for " + symbol);
    }

    @Scheduled(fixedDelay = 60000)
    public void executeTrading() {
        activeBots.forEach((symbol, isActive) -> {
            if (isActive) {
                try {
                    executeTradingLogic(symbol);
                } catch (Exception e) {
                    addLog("Error trading " + symbol + ": " + e.getMessage());
                }
            }
        });
    }

    private void executeTradingLogic(String symbol) {
        // TODO: fetch historical prices, calculate indicators, place orders
        addLog("Trading logic executed for " + symbol);
    }

    public Map<String, Boolean> getBotStatus() {
        return new HashMap<>(activeBots);
    }

    public List<String> getLogs() {
        return new ArrayList<>(logs);
    }

    private void addLog(String message) {
        String timestamp = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        logs.add(timestamp + " - " + message);
        if (logs.size() > 1000) {
            logs.remove(0);
        }
    }

    public double calculateRSI(List<Double> prices, int period) {
        if (prices.size() < period) return 50;

        double gains = 0;
        double losses = 0;

        for (int i = prices.size() - period; i < prices.size(); i++) {
            double change = prices.get(i) - prices.get(i - 1);
            if (change > 0) gains += change;
            else losses += Math.abs(change);
        }

        double avgGain = gains / period;
        double avgLoss = losses / period;
        double rs = avgLoss == 0 ? 100 : avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    public double calculateMA(List<Double> prices, int period) {
        if (prices.size() < period) return prices.get(prices.size() - 1);

        double sum = 0;
        for (int i = prices.size() - period; i < prices.size(); i++) {
            sum += prices.get(i);
        }
        return sum / period;
    }

    public Map<String, Object> calculateMACD(List<Double> prices) {
        int fastPeriod = 12;
        int slowPeriod = 26;
        int signalPeriod = 9;

        List<Double> ema12 = calculateEMA(prices, fastPeriod);
        List<Double> ema26 = calculateEMA(prices, slowPeriod);

        List<Double> macdLine = new ArrayList<>();
        for (int i = 0; i < ema12.size(); i++) {
            macdLine.add(ema12.get(i) - ema26.get(i));
        }

        List<Double> signalLine = calculateEMA(macdLine, signalPeriod);

        return Map.of(
            "macd", macdLine.get(macdLine.size() - 1),
            "signal", signalLine.get(signalLine.size() - 1),
            "histogram", macdLine.get(macdLine.size() - 1) - signalLine.get(signalLine.size() - 1)
        );
    }

    private List<Double> calculateEMA(List<Double> prices, int period) {
        List<Double> ema = new ArrayList<>();
        double multiplier = 2.0 / (period + 1);

        for (int i = 0; i < prices.size(); i++) {
            if (i < period - 1) {
                ema.add(prices.get(i));
            } else if (i == period - 1) {
                double sma = prices.subList(0, period).stream().mapToDouble(Double::doubleValue).average().orElse(0);
                ema.add(sma);
            } else {
                double previousEMA = ema.get(i - 1);
                double currentEMA = (prices.get(i) - previousEMA) * multiplier + previousEMA;
                ema.add(currentEMA);
            }
        }

        return ema;
    }
}