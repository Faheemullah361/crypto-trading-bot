package com.cryptotrading.repository;

import com.cryptotrading.model.Trade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TradeRepository extends JpaRepository<Trade, Long> {
    // Custom query methods can be defined here if needed
}