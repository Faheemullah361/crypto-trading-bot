package com.cryptotrading.service;

import com.cryptotrading.model.Order;
import com.cryptotrading.model.Trade;
import com.cryptotrading.repository.OrderRepository;
import com.cryptotrading.repository.TradeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class OrderExecutionService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private TradeRepository tradeRepository;

    @Autowired(required = false)
    private CoinDataService coinDataService;

    private final Map<String, BigDecimal> holdingQuantities = new ConcurrentHashMap<>();
    private final Map<String, BigDecimal> holdingAveragePrices = new ConcurrentHashMap<>();
    private final Map<String, BigDecimal> holdingLastPrices = new ConcurrentHashMap<>();
    private BigDecimal totalBalance = new BigDecimal("10000");
    private BigDecimal totalInvested = BigDecimal.ZERO;
    private BigDecimal totalPnL = BigDecimal.ZERO;

    @Transactional
    public Order createOrder(String symbol, String type, Double quantity, Double price) {
        return createOrder(symbol, type, quantity, price, "MARKET", 0.0, 0.0);
    }

    @Transactional
    public Order createOrder(String symbol, String type, Double quantity, Double price, 
                           String orderMode, Double limitPrice, Double stopPrice) {
        Order order = new Order();
        order.setSymbol(symbol.toUpperCase());
        order.setType(Order.OrderType.valueOf(type.toUpperCase()));
        order.setQuantity(BigDecimal.valueOf(quantity));
        order.setPrice(BigDecimal.valueOf(price));
        order.setOrderMode(Order.OrderMode.valueOf(orderMode.toUpperCase()));
        order.setStatus(Order.OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setFilledQuantity(BigDecimal.ZERO);

        if (limitPrice != null && limitPrice > 0) {
            order.setLimitPrice(BigDecimal.valueOf(limitPrice));
        }
        if (stopPrice != null && stopPrice > 0) {
            order.setStopPrice(BigDecimal.valueOf(stopPrice));
        }

        validateOrder(order);
        order = orderRepository.save(order);

        if (order.getOrderMode() == Order.OrderMode.MARKET && shouldFillOrder(order)) {
            fillOrder(order);
        }

        return order;
    }

    private void validateOrder(Order order) {
        if (order.getType() == Order.OrderType.BUY) {
            BigDecimal requiredBalance = order.getQuantity().multiply(order.getPrice());
            if (totalBalance.compareTo(requiredBalance) < 0) {
                throw new RuntimeException("Insufficient balance. Required: " + requiredBalance + ", Available: " + totalBalance);
            }
        } else if (order.getType() == Order.OrderType.SELL) {
            BigDecimal availableQty = holdingQuantities.getOrDefault(order.getSymbol(), BigDecimal.ZERO);
            if (availableQty.compareTo(order.getQuantity()) < 0) {
                throw new RuntimeException("Insufficient holdings. Required: " + order.getQuantity() + ", Available: " + availableQty);
            }
        }

        if (order.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }

        if (order.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Price must be greater than zero");
        }
    }

    private boolean shouldFillOrder(Order order) {
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            return false;
        }

        if (order.getOrderMode() == Order.OrderMode.MARKET) {
            return true;
        }

        BigDecimal currentPrice = getCurrentMarketPrice(order.getSymbol());

        if (order.getOrderMode() == Order.OrderMode.LIMIT) {
            if (order.getType() == Order.OrderType.BUY) {
                return currentPrice.compareTo(order.getLimitPrice()) <= 0 && hasValidBalance(order);
            } else {
                return currentPrice.compareTo(order.getLimitPrice()) >= 0 && hasValidBalance(order);
            }
        } else if (order.getOrderMode() == Order.OrderMode.STOP_LOSS) {
            if (order.getType() == Order.OrderType.BUY) {
                return currentPrice.compareTo(order.getStopPrice()) >= 0 && hasValidBalance(order);
            } else {
                return currentPrice.compareTo(order.getStopPrice()) <= 0 && hasValidBalance(order);
            }
        }

        return false;
    }

    private boolean hasValidBalance(Order order) {
        if (order.getType() == Order.OrderType.BUY) {
            BigDecimal requiredBalance = order.getQuantity().multiply(order.getPrice());
            return totalBalance.compareTo(requiredBalance) >= 0;
        } else {
            return holdingQuantities.getOrDefault(order.getSymbol(), BigDecimal.ZERO)
                .compareTo(order.getQuantity()) >= 0;
        }
    }

    private BigDecimal getCurrentMarketPrice(String symbol) {
        try {
            if (coinDataService != null) {
                Map<String, Object> priceData = coinDataService.getCoinPrice(symbol.toLowerCase());
                if (priceData != null && priceData.containsKey("price")) {
                    Object priceObj = priceData.get("price");
                    Double price = priceObj instanceof Number ? ((Number) priceObj).doubleValue() : 0.0;
                    return BigDecimal.valueOf(price);
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to get market price for " + symbol + ": " + e.getMessage());
        }
        return holdingLastPrices.getOrDefault(symbol, BigDecimal.ZERO);
    }

    @Transactional
    public void fillOrder(Order order) {
        order.setStatus(Order.OrderStatus.FILLED);
        order.setFilledAt(LocalDateTime.now());
        order.setFilledQuantity(order.getQuantity());

        BigDecimal totalValue = order.getQuantity().multiply(order.getPrice());

        Trade trade = new Trade(
            order.getSymbol(),
            order.getType() == Order.OrderType.BUY ? Trade.TradeType.BUY : Trade.TradeType.SELL,
            order.getQuantity(),
            order.getPrice(),
            totalValue,
            LocalDateTime.now()
        );
        tradeRepository.save(trade);

        if (order.getType() == Order.OrderType.BUY) {
            executeBuyOrder(order, totalValue);
        } else {
            executeSellOrder(order, totalValue);
        }

        orderRepository.save(order);
    }

    private void executeBuyOrder(Order order, BigDecimal totalValue) {
        totalBalance = totalBalance.subtract(totalValue);
        totalInvested = totalInvested.add(totalValue);

        BigDecimal currentQty = holdingQuantities.getOrDefault(order.getSymbol(), BigDecimal.ZERO);
        BigDecimal currentAvgPrice = holdingAveragePrices.getOrDefault(order.getSymbol(), BigDecimal.ZERO);

        BigDecimal newQty = currentQty.add(order.getQuantity());
        BigDecimal newAvgPrice = currentQty.compareTo(BigDecimal.ZERO) == 0 ?
            order.getPrice() :
            currentQty.multiply(currentAvgPrice).add(order.getQuantity().multiply(order.getPrice()))
                .divide(newQty, RoundingMode.HALF_UP);

        holdingQuantities.put(order.getSymbol(), newQty);
        holdingAveragePrices.put(order.getSymbol(), newAvgPrice);
        holdingLastPrices.put(order.getSymbol(), order.getPrice());
    }

    private void executeSellOrder(Order order, BigDecimal totalValue) {
        BigDecimal currentQty = holdingQuantities.getOrDefault(order.getSymbol(), BigDecimal.ZERO);
        BigDecimal avgPrice = holdingAveragePrices.getOrDefault(order.getSymbol(), BigDecimal.ZERO);

        BigDecimal profit = order.getQuantity().multiply(order.getPrice().subtract(avgPrice));
        totalPnL = totalPnL.add(profit);
        totalBalance = totalBalance.add(totalValue);

        BigDecimal remainingQty = currentQty.subtract(order.getQuantity());
        holdingQuantities.put(order.getSymbol(), remainingQty);
        holdingLastPrices.put(order.getSymbol(), order.getPrice());

        if (remainingQty.compareTo(BigDecimal.ZERO) <= 0) {
            holdingAveragePrices.remove(order.getSymbol());
            holdingQuantities.remove(order.getSymbol());
        }
    }

    @Transactional
    public void cancelOrder(Long orderId) {
        var order = orderRepository.findById(orderId);
        if (order.isPresent()) {
            Order o = order.get();
            o.setStatus(Order.OrderStatus.CANCELLED);
            o.setCancelledAt(LocalDateTime.now());
            orderRepository.save(o);
        }
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getPendingOrders() {
        return orderRepository.findAllPendingOrders();
    }

    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(Order.OrderStatus.valueOf(status.toUpperCase()));
    }

    public List<Order> getOrdersBySymbol(String symbol) {
        return orderRepository.findBySymbol(symbol.toUpperCase());
    }

    public List<Order> getOrdersByType(String type) {
        return orderRepository.findByType(Order.OrderType.valueOf(type.toUpperCase()));
    }

    public List<Trade> getAllTrades() {
        return tradeRepository.findAll();
    }

    public Map<String, Object> getPortfolioSummary() {
        Map<String, Object> portfolio = new HashMap<>();
        portfolio.put("totalBalance", totalBalance);
        portfolio.put("totalInvested", totalInvested);
        portfolio.put("totalPnL", totalPnL);
        
        Map<String, Object> holdings = new HashMap<>();
        holdingQuantities.forEach((symbol, qty) -> {
            Map<String, Object> holding = new HashMap<>();
            holding.put("quantity", qty);
            holding.put("avgPrice", holdingAveragePrices.get(symbol));
            holding.put("lastPrice", holdingLastPrices.get(symbol));
            holdings.put(symbol, holding);
        });
        portfolio.put("holdings", holdings);
        return portfolio;
    }

    public Map<String, Object> getOrderStatistics() {
        List<Order> allOrders = getAllOrders();
        
        long totalOrders = allOrders.size();
        long pendingCount = allOrders.stream().filter(o -> o.getStatus() == Order.OrderStatus.PENDING).count();
        long filledCount = allOrders.stream().filter(o -> o.getStatus() == Order.OrderStatus.FILLED).count();
        long cancelledCount = allOrders.stream().filter(o -> o.getStatus() == Order.OrderStatus.CANCELLED).count();
        
        double fillRate = totalOrders > 0 ? (filledCount * 100.0 / totalOrders) : 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", totalOrders);
        stats.put("pending", pendingCount);
        stats.put("filled", filledCount);
        stats.put("cancelled", cancelledCount);
        stats.put("fillRate", fillRate);
        
        return stats;
    }

    @Scheduled(fixedRate = 10000)
    @Transactional
    public void processLimitOrders() {
        List<Order> pendingOrders = getPendingOrders();
        
        for (Order order : pendingOrders) {
            if (order.getOrderMode() == Order.OrderMode.LIMIT || 
                order.getOrderMode() == Order.OrderMode.STOP_LOSS) {
                if (shouldFillOrder(order)) {
                    fillOrder(order);
                }
            }
        }
    }

    public BigDecimal getTotalBalance() {
        return totalBalance;
    }

    public Map<String, BigDecimal> getHoldings() {
        return new HashMap<>(holdingQuantities);
    }
}
