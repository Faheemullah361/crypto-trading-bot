package com.cryptotrading.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trading/legacy")
class TradingController {
    // Legacy no-op controller retained to satisfy older routes; new controllers live in TradingControllerNew.
}