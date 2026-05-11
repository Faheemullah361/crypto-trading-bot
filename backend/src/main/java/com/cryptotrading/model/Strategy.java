package com.cryptotrading.model;

import java.time.LocalDateTime;
import java.util.Map;

public class Strategy {
    private String id;
    private String name;
    private String symbol;
    private boolean enabled;
    private String type;
    private Map<String, Object> parameters;
    private StrategyPerformance performance;
    private LocalDateTime createdAt;

    public Strategy() {
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Map<String, Object> getParameters() { return parameters; }
    public void setParameters(Map<String, Object> parameters) { this.parameters = parameters; }

    public StrategyPerformance getPerformance() { return performance; }
    public void setPerformance(StrategyPerformance performance) { this.performance = performance; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
