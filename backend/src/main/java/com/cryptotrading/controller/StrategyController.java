package com.cryptotrading.controller;

import com.cryptotrading.model.Strategy;
import com.cryptotrading.model.StrategyPerformance;
import com.cryptotrading.service.StrategyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/strategies")
public class StrategyController {

    private final StrategyService strategyService;

    public StrategyController(StrategyService strategyService) {
        this.strategyService = strategyService;
    }

    @PostMapping
    public ResponseEntity<?> createStrategy(@RequestBody Strategy strategy) {
        Strategy created = strategyService.create(strategy);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<?> listStrategies() {
        return ResponseEntity.ok(strategyService.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStrategy(@PathVariable String id, @RequestBody Strategy updates) {
        Strategy updated = strategyService.update(id, updates);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStrategy(@PathVariable String id) {
        boolean removed = strategyService.delete(id);
        if (!removed) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("message", "Strategy deleted"));
    }

    @GetMapping("/{id}/performance")
    public ResponseEntity<?> getPerformance(@PathVariable String id) {
        StrategyPerformance perf = strategyService.getPerformance(id);
        if (perf == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(perf);
    }
}
