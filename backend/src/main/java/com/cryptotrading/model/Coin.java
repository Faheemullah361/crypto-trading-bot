package com.cryptotrading.model;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coins")
public class Coin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String symbol;

    @Column(nullable = false)
    private String name;

    @Column(precision = 19, scale = 8)
    private BigDecimal currentPrice;

    @Column(precision = 19, scale = 8)
    private BigDecimal priceChange24h;

    @Column(precision = 19, scale = 8)
    private BigDecimal priceChangePercent24h;

    @Column(precision = 19, scale = 2)
    private BigDecimal marketCap;

    @Column(precision = 19, scale = 2)
    private BigDecimal volume24h;

    @Column(precision = 19, scale = 8)
    private BigDecimal ath;

    @Column(precision = 19, scale = 8)
    private BigDecimal atl;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    public Coin() {}

    public Coin(String symbol, String name) {
        this.symbol = symbol;
        this.name = name;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }

    public BigDecimal getPriceChange24h() { return priceChange24h; }
    public void setPriceChange24h(BigDecimal priceChange24h) { this.priceChange24h = priceChange24h; }

    public BigDecimal getPriceChangePercent24h() { return priceChangePercent24h; }
    public void setPriceChangePercent24h(BigDecimal priceChangePercent24h) { this.priceChangePercent24h = priceChangePercent24h; }

    public BigDecimal getMarketCap() { return marketCap; }
    public void setMarketCap(BigDecimal marketCap) { this.marketCap = marketCap; }

    public BigDecimal getVolume24h() { return volume24h; }
    public void setVolume24h(BigDecimal volume24h) { this.volume24h = volume24h; }

    public BigDecimal getAth() { return ath; }
    public void setAth(BigDecimal ath) { this.ath = ath; }

    public BigDecimal getAtl() { return atl; }
    public void setAtl(BigDecimal atl) { this.atl = atl; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}