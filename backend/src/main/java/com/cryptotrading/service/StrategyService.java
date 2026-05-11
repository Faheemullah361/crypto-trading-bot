package com.cryptotrading.service;

import com.cryptotrading.model.Strategy;
import com.cryptotrading.model.StrategyPerformance;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class StrategyService {
    private final Map<String, Strategy> strategies = new ConcurrentHashMap<>();

    public StrategyService() {
        // Seed one demo strategy so the UI has content.
        Strategy demo = new Strategy();
        demo.setId(UUID.randomUUID().toString());
        demo.setName("Demo RSI");
        demo.setSymbol("BTC");
        demo.setType("RSI");
        demo.setEnabled(false);
        demo.setParameters(Map.of("rsiPeriod", 14, "buyThreshold", 30, "sellThreshold", 70));
        StrategyPerformance perf = new StrategyPerformance();
        perf.setTotalTrades(0);
        perf.setWinningTrades(0);
        perf.setLosingTrades(0);
        perf.setWinRate(0);
        perf.setTotalPnL(0);
        perf.setMaxDrawdown(0);
        perf.setProfitFactor(0);
        demo.setPerformance(perf);
        demo.setCreatedAt(LocalDateTime.now());
        strategies.put(demo.getId(), demo);
    }

    public Strategy create(Strategy strategy) {
        strategy.setId(UUID.randomUUID().toString());
        strategy.setCreatedAt(LocalDateTime.now());
        StrategyPerformance perf = strategy.getPerformance();
        if (perf == null) {
            perf = new StrategyPerformance();
            strategy.setPerformance(perf);
        }
        strategies.put(strategy.getId(), strategy);
        return strategy;
    }

    public Collection<Strategy> findAll() {
        return new ArrayList<>(strategies.values());
    }

    public Strategy update(String id, Strategy updates) {
        Strategy existing = strategies.get(id);
        if (existing == null) {
            return null;
        }
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getSymbol() != null) existing.setSymbol(updates.getSymbol());
        if (updates.getType() != null) existing.setType(updates.getType());
        existing.setEnabled(updates.isEnabled());
        if (updates.getParameters() != null) existing.setParameters(updates.getParameters());
        if (updates.getPerformance() != null) existing.setPerformance(updates.getPerformance());
        return existing;
    }

    public boolean delete(String id) {
        return strategies.remove(id) != null;
    }

    public StrategyPerformance getPerformance(String id) {
        Strategy strategy = strategies.get(id);
        return strategy == null ? null : strategy.getPerformance();
    }
}
