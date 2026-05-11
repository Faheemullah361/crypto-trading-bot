package com.cryptotrading.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    private final Random random = new Random();

    @GetMapping("/orderbook/{symbol}")
    public ResponseEntity<?> getOrderBook(@PathVariable String symbol) {
        // Lightweight synthetic order book for UI display.
        List<List<BigDecimal>> bids = List.of(
            List.of(bd(0.99), bd(1.2)),
            List.of(bd(0.97), bd(0.8)),
            List.of(bd(0.95), bd(1.5))
        );
        List<List<BigDecimal>> asks = List.of(
            List.of(bd(1.01), bd(1.3)),
            List.of(bd(1.03), bd(0.7)),
            List.of(bd(1.05), bd(1.1))
        );
        return ResponseEntity.ok(Map.of(
            "bids", bids,
            "asks", asks,
            "timestamp", Instant.now().toEpochMilli()
        ));
    }

    @GetMapping("/ticker/{symbol}")
    public ResponseEntity<?> getTicker(@PathVariable String symbol) {
        double price = 100 + random.nextDouble() * 50;
        double change = (random.nextDouble() - 0.5) * 5;
        double volume = 1_000_000 + random.nextDouble() * 500_000;
        return ResponseEntity.ok(Map.of(
            "symbol", symbol.toUpperCase(),
            "price", price,
            "changePercent", change,
            "volume", volume,
            "timestamp", Instant.now().toEpochMilli()
        ));
    }

    private BigDecimal bd(double value) {
        return BigDecimal.valueOf(value);
    }
}
