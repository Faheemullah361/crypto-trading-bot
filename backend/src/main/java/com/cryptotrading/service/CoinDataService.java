package com.cryptotrading.service;

import com.cryptotrading.model.Coin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;

@Service
public class CoinDataService {

    private static final String API_BASE = "https://api.coingecko.com/api/v3";
    private static final String BINANCE_BASE = "https://api.binance.com/api/v3";
    private static final int REQUEST_TIMEOUT = 5000; // 5 seconds
    
    private final RestTemplate restTemplate;
    private final ExecutorService executor = Executors.newFixedThreadPool(2);
    private List<Coin> cachedCoins = new ArrayList<>();
    private long cacheTimestamp = 0;
    private static final long CACHE_DURATION = 30000; // 30 seconds

    @Autowired
    public CoinDataService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<Coin> getTopCoins(int limit) {
        // Return cached data if still valid
        if (!cachedCoins.isEmpty() && System.currentTimeMillis() - cacheTimestamp < CACHE_DURATION) {
            return new ArrayList<>(cachedCoins.subList(0, Math.min(limit, cachedCoins.size())));
        }

        // Try to fetch from primary API with timeout
        try {
            List<Coin> coins = fetchFromCoinGeckoWithTimeout(limit);
            if (!coins.isEmpty()) {
                cachedCoins = new ArrayList<>(coins);
                cacheTimestamp = System.currentTimeMillis();
                return coins;
            }
        } catch (Exception ex) {
            System.err.println("CoinGecko fetch failed: " + ex.getMessage());
        }

        // Fallback to Binance public ticker
        try {
            List<Coin> coins = getTopCoinsFromBinance(limit);
            if (!coins.isEmpty()) {
                cachedCoins = new ArrayList<>(coins);
                cacheTimestamp = System.currentTimeMillis();
                return coins;
            }
        } catch (Exception ex) {
            System.err.println("Binance fetch failed: " + ex.getMessage());
        }

        // Return cached data even if expired, or empty list
        return new ArrayList<>(cachedCoins);
    }

    private List<Coin> fetchFromCoinGeckoWithTimeout(int limit) throws TimeoutException {
        Future<List<Coin>> future = executor.submit(() -> {
            try {
                String url = String.format(
                    "%s/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=%d&sparkline=false&locale=en",
                    API_BASE, limit
                );

                List<?> response = restTemplate.getForObject(url, List.class);
                if (response == null) return List.of();

                List<Coin> coins = new ArrayList<>();
                for (Object item : response) {
                    Map<?, ?> data = (Map<?, ?>) item;
                    Coin coin = new Coin();
                    coin.setSymbol(getString(data, "symbol").toUpperCase());
                    coin.setName(getString(data, "name"));
                    coin.setCurrentPrice(toBigDecimal(data.get("current_price")));
                    coin.setPriceChange24h(toBigDecimal(data.get("price_change_24h")));
                    coin.setPriceChangePercent24h(toBigDecimal(data.get("price_change_percentage_24h")));
                    coin.setMarketCap(toBigDecimal(data.get("market_cap")));
                    coin.setVolume24h(toBigDecimal(data.get("total_volume")));
                    coin.setAth(toBigDecimal(data.get("ath")));
                    coin.setAtl(toBigDecimal(data.get("atl")));
                    coin.setImageUrl(getString(data, "image"));
                    coin.setLastUpdated(LocalDateTime.now());
                    coins.add(coin);
                }
                return coins;
            } catch (RestClientException e) {
                throw new RuntimeException("API call failed", e);
            }
        });

        try {
            return future.get(REQUEST_TIMEOUT, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            future.cancel(true);
            throw e;
        } catch (Exception e) {
            future.cancel(true);
            throw new RuntimeException(e);
        }
    }

    public Map<String, Object> getCoinPrice(String coinId) {
        // Try CoinGecko with timeout
        try {
            Future<Map<String, Object>> future = executor.submit(() -> {
                String url = String.format("%s/simple/price?ids=%s&vs_currencies=usd", API_BASE, coinId);
                Map<?, ?> response = restTemplate.getForObject(url, Map.class);
                if (response == null || response.get(coinId) == null) return Map.of("price", 0d);
                Map<?, ?> coinData = (Map<?, ?>) response.get(coinId);
                Object usd = coinData.get("usd");
                double price = usd instanceof Number ? ((Number) usd).doubleValue() : 0.0;
                return Map.of("price", price);
            });
            return future.get(REQUEST_TIMEOUT, TimeUnit.MILLISECONDS);
        } catch (Exception ex) {
            System.err.println("CoinGecko price fetch failed: " + ex.getMessage());
        }

        // Fallback to Binance
        try {
            String pair = toBinancePair(coinId);
            String url = String.format("%s/ticker/price?symbol=%s", BINANCE_BASE, pair);
            Map<?, ?> response = restTemplate.getForObject(url, Map.class);
            if (response == null) return Map.of("price", 0d);
            Object priceObj = response.get("price");
            double price = priceObj instanceof String ? Double.parseDouble((String) priceObj)
                : priceObj instanceof Number ? ((Number) priceObj).doubleValue() : 0.0;
            return Map.of("price", price);
        } catch (Exception ex) {
            System.err.println("Binance price fetch failed: " + ex.getMessage());
            return Map.of("price", 0d);
        }
    }

    public List<Map<String, Object>> getCoinChartData(String coinId, int days) {
        // Try CoinGecko with timeout
        try {
            Future<List<Map<String, Object>>> future = executor.submit(() -> {
                String url = String.format(
                    "%s/coins/%s/market_chart?vs_currency=usd&days=%d&interval=daily",
                    API_BASE, coinId, days
                );
                Map<?, ?> response = restTemplate.getForObject(url, Map.class);
                if (response == null || response.get("prices") == null) return List.of();

                List<List<Number>> prices = (List<List<Number>>) response.get("prices");
                List<List<Number>> volumes = (List<List<Number>>) response.get("volumes");

                List<Map<String, Object>> chart = new ArrayList<>();
                for (int i = 0; i < prices.size(); i++) {
                    List<Number> pricePoint = prices.get(i);
                    Number timestamp = pricePoint.get(0);
                    Number price = pricePoint.get(1);
                    Number volume = volumes != null && volumes.size() > i && volumes.get(i).size() > 1
                        ? volumes.get(i).get(1)
                        : 0L;

                    Map<String, Object> point = new HashMap<>();
                    point.put("time", timestamp.longValue());
                    point.put("price", price.doubleValue());
                    point.put("volume", volume.doubleValue());
                    chart.add(point);
                }

                return chart;
            });
            return future.get(REQUEST_TIMEOUT, TimeUnit.MILLISECONDS);
        } catch (Exception ex) {
            System.err.println("CoinGecko chart fetch failed: " + ex.getMessage());
        }

        // Fallback using Binance klines
        try {
            String pair = toBinancePair(coinId);
            String url = String.format("%s/klines?symbol=%s&interval=1d&limit=%d", BINANCE_BASE, pair, days);
            List<List<Object>> klines = restTemplate.getForObject(url, List.class);
            if (klines == null) return List.of();
            List<Map<String, Object>> chart = new ArrayList<>();
            for (List<Object> k : klines) {
                long openTime = ((Number) k.get(0)).longValue();
                double close = Double.parseDouble(k.get(4).toString());
                double volume = Double.parseDouble(k.get(5).toString());
                Map<String, Object> point = new HashMap<>();
                point.put("time", openTime);
                point.put("price", close);
                point.put("volume", volume);
                chart.add(point);
            }
            return chart;
        } catch (Exception ex) {
            System.err.println("Binance chart fetch failed: " + ex.getMessage());
            return List.of();
        }
    }

    private List<Coin> getTopCoinsFromBinance(int limit) {
        // Use a fixed set of large-cap pairs for reliability
        String[] pairs = {"BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "ADAUSDT", "XRPUSDT"};
        String query = BINANCE_BASE + "/ticker/24hr?symbols=" + urlEncodeArray(Arrays.copyOf(pairs, Math.min(pairs.length, Math.max(limit, 1))));
        List<Map<String, Object>> response = restTemplate.getForObject(query, List.class);
        if (response == null) return List.of();
        List<Coin> coins = new ArrayList<>();
        for (Map<String, Object> item : response) {
            String symbolPair = item.get("symbol").toString();
            String symbol = symbolPair.replace("USDT", "");
            Coin coin = new Coin();
            coin.setSymbol(symbol);
            coin.setName(symbol);
            coin.setCurrentPrice(new BigDecimal(item.get("lastPrice").toString()));
            coin.setPriceChange24h(new BigDecimal(item.get("priceChange").toString()));
            coin.setPriceChangePercent24h(new BigDecimal(item.get("priceChangePercent").toString()));
            coin.setMarketCap(BigDecimal.ZERO);
            coin.setVolume24h(new BigDecimal(item.get("quoteVolume").toString()));
            coin.setAth(BigDecimal.ZERO);
            coin.setAtl(BigDecimal.ZERO);
            coin.setImageUrl("");
            coin.setLastUpdated(LocalDateTime.now());
            coins.add(coin);
        }
        return coins;
    }

    private String urlEncodeArray(String[] arr) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            sb.append('"').append(arr[i]).append('"');
            if (i < arr.length - 1) sb.append(',');
        }
        sb.append(']');
        return sb.toString();
    }

    private String toBinancePair(String coinId) {
        // Frontend sends lowercase symbol as id (e.g., "btc", "eth")
        String sym = coinId == null ? "BTC" : coinId.toUpperCase();
        // Handle common full IDs
        if ("BITCOIN".equals(sym)) sym = "BTC";
        if ("ETHEREUM".equals(sym)) sym = "ETH";
        if ("BINANCECOIN".equals(sym) || "BNB".equals(sym)) sym = "BNB";
        return sym + "USDT";
    }

    private String getString(Map<?, ?> map, String key) {
        Object val = map.get(key);
        return val == null ? "" : val.toString();
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof Number) {
            return BigDecimal.valueOf(((Number) value).doubleValue());
        }
        try {
            return new BigDecimal(value.toString());
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

}