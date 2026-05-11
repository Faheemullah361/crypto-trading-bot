package com.cryptotrading.controller;

import com.cryptotrading.service.TradingBotService;
import com.cryptotrading.service.OrderExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/trading")
public class TradingControllerNew {

    @Autowired
    private TradingBotService tradingBotService;

    @Autowired
    private OrderExecutionService orderExecutionService;

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> orderData) {
        try {
            var order = orderExecutionService.createOrder(
                orderData.get("symbol").toString(),
                orderData.get("type").toString(),
                Double.parseDouble(orderData.get("quantity").toString()),
                Double.parseDouble(orderData.get("price").toString())
            );
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/orders/advanced")
    public ResponseEntity<?> createAdvancedOrder(@RequestBody Map<String, Object> orderData) {
        try {
            String orderMode = orderData.getOrDefault("orderMode", "MARKET").toString();
            
            Double limitPrice = null;
            if (orderData.containsKey("limitPrice") && orderData.get("limitPrice") != null) {
                Object lp = orderData.get("limitPrice");
                limitPrice = lp instanceof Number ? ((Number) lp).doubleValue() : Double.parseDouble(lp.toString());
            }
            
            Double stopPrice = null;
            if (orderData.containsKey("stopPrice") && orderData.get("stopPrice") != null) {
                Object sp = orderData.get("stopPrice");
                stopPrice = sp instanceof Number ? ((Number) sp).doubleValue() : Double.parseDouble(sp.toString());
            }

            var order = orderExecutionService.createOrder(
                orderData.get("symbol").toString(),
                orderData.get("type").toString(),
                Double.parseDouble(orderData.get("quantity").toString()),
                Double.parseDouble(orderData.get("price").toString()),
                orderMode,
                limitPrice,
                stopPrice
            );
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(@RequestParam(required = false) String status,
                                       @RequestParam(required = false) String symbol) {
        try {
            if (status != null) {
                return ResponseEntity.ok(orderExecutionService.getOrdersByStatus(status));
            } else if (symbol != null) {
                return ResponseEntity.ok(orderExecutionService.getOrdersBySymbol(symbol));
            } else {
                return ResponseEntity.ok(orderExecutionService.getAllOrders());
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/orders/pending")
    public ResponseEntity<?> getPendingOrders() {
        try {
            return ResponseEntity.ok(orderExecutionService.getPendingOrders());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<?> getOrder(@PathVariable Long orderId) {
        try {
            var orders = orderExecutionService.getAllOrders();
            var order = orders.stream()
                .filter(o -> o.getId().equals(orderId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Order not found"));
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/orders/{orderId}")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        try {
            orderExecutionService.cancelOrder(orderId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Order cancelled successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/trades")
    public ResponseEntity<?> getTrades() {
        try {
            return ResponseEntity.ok(orderExecutionService.getAllTrades());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/portfolio")
    public ResponseEntity<?> getPortfolio() {
        try {
            return ResponseEntity.ok(orderExecutionService.getPortfolioSummary());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/orders/stats")
    public ResponseEntity<?> getOrderStats() {
        try {
            return ResponseEntity.ok(orderExecutionService.getOrderStatistics());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/balance")
    public ResponseEntity<?> getBalance() {
        try {
            Map<String, Object> balanceInfo = new HashMap<>();
            balanceInfo.put("totalBalance", orderExecutionService.getTotalBalance());
            balanceInfo.put("holdings", orderExecutionService.getHoldings());
            return ResponseEntity.ok(balanceInfo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
