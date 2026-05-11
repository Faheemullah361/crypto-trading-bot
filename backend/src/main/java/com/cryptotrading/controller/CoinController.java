package com.cryptotrading.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/coins/legacy")
class CoinController {
    // Legacy no-op controller; CoinControllerNew provides active endpoints.
}