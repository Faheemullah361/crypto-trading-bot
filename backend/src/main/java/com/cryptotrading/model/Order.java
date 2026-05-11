package com.cryptotrading.model;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String symbol;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_mode", nullable = false)
    private OrderMode orderMode = OrderMode.MARKET;

    @Column(precision = 19, scale = 8)
    private BigDecimal quantity;

    @Column(precision = 19, scale = 8)
    private BigDecimal price;

    @Column(name = "limit_price", precision = 19, scale = 8)
    private BigDecimal limitPrice;

    @Column(name = "stop_price", precision = 19, scale = 8)
    private BigDecimal stopPrice;

    @Column(name = "filled_quantity", precision = 19, scale = 8)
    private BigDecimal filledQuantity = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "filled_at")
    private LocalDateTime filledAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "strategy_id")
    private String strategyId;

    @Column(name = "bot_id")
    private String botId;

    @Column(name = "notes", length = 500)
    private String notes;

    public enum OrderType {
        BUY, SELL
    }

    public enum OrderMode {
        MARKET,     // Execute immediately at market price
        LIMIT,      // Execute only at specified price or better
        STOP_LOSS,  // Execute when price hits stop price
        TRAILING_STOP // Execute with trailing stop percentage
    }

    public enum OrderStatus {
        PENDING, FILLED, CANCELLED, PARTIALLY_FILLED, EXPIRED
    }

    public Order() {
        this.createdAt = LocalDateTime.now();
        this.status = OrderStatus.PENDING;
        this.orderMode = OrderMode.MARKET;
        this.filledQuantity = BigDecimal.ZERO;
    }

    public Order(String symbol, OrderType type, BigDecimal quantity, BigDecimal price) {
        this.symbol = symbol;
        this.type = type;
        this.quantity = quantity;
        this.price = price;
        this.status = OrderStatus.PENDING;
        this.createdAt = LocalDateTime.now();
        this.orderMode = OrderMode.MARKET;
        this.filledQuantity = BigDecimal.ZERO;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public OrderType getType() { return type; }
    public void setType(OrderType type) { this.type = type; }

    public OrderMode getOrderMode() { return orderMode; }
    public void setOrderMode(OrderMode orderMode) { this.orderMode = orderMode; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getLimitPrice() { return limitPrice; }
    public void setLimitPrice(BigDecimal limitPrice) { this.limitPrice = limitPrice; }

    public BigDecimal getStopPrice() { return stopPrice; }
    public void setStopPrice(BigDecimal stopPrice) { this.stopPrice = stopPrice; }

    public BigDecimal getFilledQuantity() { return filledQuantity; }
    public void setFilledQuantity(BigDecimal filledQuantity) { this.filledQuantity = filledQuantity; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getFilledAt() { return filledAt; }
    public void setFilledAt(LocalDateTime filledAt) { this.filledAt = filledAt; }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }

    public String getStrategyId() { return strategyId; }
    public void setStrategyId(String strategyId) { this.strategyId = strategyId; }

    public String getBotId() { return botId; }
    public void setBotId(String botId) { this.botId = botId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
