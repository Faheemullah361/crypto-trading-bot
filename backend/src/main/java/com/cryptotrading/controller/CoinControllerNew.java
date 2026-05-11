package com.cryptotrading.controller;

import com.cryptotrading.service.CoinDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/coins")
public class CoinControllerNew {

    @Autowired
    private CoinDataService coinDataService;

    @GetMapping("/top")
    public ResponseEntity<?> getTopCoins(@RequestParam(defaultValue = "6") int limit) {
        try {
            return ResponseEntity.ok(coinDataService.getTopCoins(limit));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{coinId}/price")
    public ResponseEntity<?> getCoinPrice(@PathVariable String coinId) {
        try {
            return ResponseEntity.ok(coinDataService.getCoinPrice(coinId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{coinId}/chart")
    public ResponseEntity<?> getChartData(
        @PathVariable String coinId,
        @RequestParam(defaultValue = "30") int days
    ) {
        try {
            return ResponseEntity.ok(coinDataService.getCoinChartData(coinId, days));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
