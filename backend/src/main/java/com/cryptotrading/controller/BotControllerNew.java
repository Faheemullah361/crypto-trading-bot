package com.cryptotrading.controller;

import com.cryptotrading.service.TradingBotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/bot")
public class BotControllerNew {

    @Autowired
    private TradingBotService tradingBotService;

    @PostMapping("/start")
    public ResponseEntity<?> startBot(@RequestBody Map<String, String> request) {
        try {
            String symbol = request.get("symbol");
            tradingBotService.startTradingBot(symbol);
            return ResponseEntity.ok(Map.of("message", "Bot started for " + symbol));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/stop")
    public ResponseEntity<?> stopBot(@RequestBody Map<String, String> request) {
        try {
            String symbol = request.get("symbol");
            tradingBotService.stopTradingBot(symbol);
            return ResponseEntity.ok(Map.of("message", "Bot stopped for " + symbol));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getBotStatus() {
        try {
            return ResponseEntity.ok(tradingBotService.getBotStatus());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getBotLogs() {
        try {
            return ResponseEntity.ok(tradingBotService.getLogs());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
