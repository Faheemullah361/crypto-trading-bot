import type { Coin, ChartData, Order, Trade, Portfolio, TradingStrategy } from '../types';

const API_BASE_URL = 'http://localhost:8081/api';
const REQUEST_TIMEOUT = 8000; // 8 seconds

// Helper function to fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = REQUEST_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Coin Service
export const CoinService = {
  async getTopCoins(limit: number = 6): Promise<Coin[]> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/coins/top?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch coins');
    const data = await response.json();
    return data.map((coin: any) => ({
      id: coin.symbol.toLowerCase(),
      symbol: coin.symbol,
      name: coin.name,
      currentPrice: Number(coin.currentPrice),
      priceChange24h: Number(coin.priceChange24h || 0),
      priceChangePercent24h: Number(coin.priceChangePercent24h || 0),
      marketCap: Number(coin.marketCap || 0),
      volume24h: Number(coin.volume24h || 0),
      circulatingSupply: Number(coin.circulatingSupply || 0),
      imageUrl: coin.imageUrl,
      ath: Number(coin.ath || 0),
      atl: Number(coin.atl || 0),
      lastUpdated: coin.lastUpdated || new Date().toISOString(),
    }));
  },

  async getCoinPrice(coinId: string): Promise<number> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/coins/${coinId}/price`);
    if (!response.ok) throw new Error('Failed to fetch coin price');
    const data = await response.json();
    return Number(data.price || 0);
  },

  async getCoinChartData(coinId: string, days: number = 30): Promise<ChartData[]> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/coins/${coinId}/chart?days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch chart data');
    const data = await response.json();
    return data.map((point: any) => ({
      time: point.time,
      price: Number(point.price),
      volume: Number(point.volume || 0),
    }));
  },
};

// Trading Service
export const TradingService = {
  async createOrder(order: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<Order> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/trading/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  },

  async getOrders(): Promise<Order[]> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/trading/orders`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  async cancelOrder(orderId: string): Promise<void> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/trading/orders/${orderId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to cancel order');
  },

  async getTrades(): Promise<Trade[]> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/trading/trades`);
    if (!response.ok) throw new Error('Failed to fetch trades');
    return response.json();
  },

  async getPortfolio(): Promise<Portfolio> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/trading/portfolio`);
    if (!response.ok) throw new Error('Failed to fetch portfolio');
    return response.json();
  },
};

// Strategy Service
export const StrategyService = {
  async createStrategy(strategy: Omit<TradingStrategy, 'id' | 'createdAt'>): Promise<TradingStrategy> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/strategies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(strategy),
    });
    if (!response.ok) throw new Error('Failed to create strategy');
    return response.json();
  },

  async getStrategies(): Promise<TradingStrategy[]> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/strategies`);
    if (!response.ok) throw new Error('Failed to fetch strategies');
    return response.json();
  },

  async updateStrategy(id: string, updates: Partial<TradingStrategy>): Promise<TradingStrategy> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/strategies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update strategy');
    return response.json();
  },

  async deleteStrategy(id: string): Promise<void> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/strategies/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete strategy');
  },

  async getStrategyPerformance(id: string) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/strategies/${id}/performance`);
    if (!response.ok) throw new Error('Failed to fetch strategy performance');
    return response.json();
  },
};

// Bot Service
export const BotService = {
  async startBot(symbol: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/bot/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol }),
    });
    if (!response.ok) throw new Error('Failed to start bot');
    return response.json();
  },

  async stopBot(symbol: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/bot/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol }),
    });
    if (!response.ok) throw new Error('Failed to stop bot');
  },

  async getBotStatus(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/bot/status`);
    if (!response.ok) throw new Error('Failed to fetch bot status');
    return response.json();
  },

  async getBotLogs(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/bot/logs`);
    if (!response.ok) throw new Error('Failed to fetch bot logs');
    return response.json();
  },
};

// Market Data Service
export const MarketDataService = {
  async getOrderBook(symbol: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/market/orderbook/${symbol}`);
    if (!response.ok) throw new Error('Failed to fetch order book');
    return response.json();
  },

  async getTicker(symbol: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/market/ticker/${symbol}`);
    if (!response.ok) throw new Error('Failed to fetch ticker');
    return response.json();
  },
};
