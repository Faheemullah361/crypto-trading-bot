// Coin types
export interface Coin {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  imageUrl: string;
  ath: number;
  atl: number;
  lastUpdated: string;
}

export interface CoinPrice {
  symbol: string;
  price: number;
  timestamp: number;
}

export interface ChartData {
  time: number;
  price: number;
  volume: number;
}

export interface Order {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
  createdAt: string;
  filledAt?: string;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  totalValue: number;
  timestamp: string;
  strategyId?: string;
}

export interface Portfolio {
  totalBalance: number;
  totalInvested: number;
  totalPnL: number;
  totalPnLPercent: number;
  holdings: Holding[];
  trades: Trade[];
}

export interface Holding {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlPercent: number;
  percentageOfPortfolio: number;
}

export interface TradingStrategy {
  id: string;
  name: string;
  symbol: string;
  enabled: boolean;
  type: 'MANUAL' | 'CUSTOM';
  parameters: StrategyParams;
  performance: StrategyPerformance;
  createdAt: string;
}

export interface StrategyParams {
  buyThreshold?: number;
  sellThreshold?: number;
  rsiPeriod?: number;
  maPeriod?: number;
  maxTradeSize?: number;
  stopLoss?: number;
  takeProfit?: number;
  buyPriceThreshold?: number;
  sellPriceThreshold?: number;
  buyPercentageChange?: number;
  sellPercentageChange?: number;
  [key: string]: any;
}

export interface StrategyPerformance {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  maxDrawdown: number;
  profitFactor: number;
}

export interface MarketData {
  coin: Coin;
  priceHistory: ChartData[];
  orderBook: OrderBook;
  lastUpdate: string;
}

export interface OrderBook {
  bids: [number, number][];
  asks: [number, number][];
  timestamp: number;
}

export interface WebSocketMessage {
  type: 'PRICE_UPDATE' | 'TRADE' | 'ORDER_UPDATE' | 'CHART_DATA';
  data: any;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}
