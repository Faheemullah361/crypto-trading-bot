import type { ChartData } from '../types';

export const formatCurrency = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercent = (value: number, decimals: number = 2): string => {
  return `${(value > 0 ? '+' : '')}${value.toFixed(decimals)}%`;
};

export const formatCompactNumber = (value: number): string => {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(2);
};

export const getPriceChangeColor = (change: number): string => {
  if (change > 0) return 'text-green-500';
  if (change < 0) return 'text-red-500';
  return 'text-gray-500';
};

export const getPriceChangeBackgroundColor = (change: number): string => {
  if (change > 0) return 'bg-green-100 text-green-700';
  if (change < 0) return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
};

export const calculateMA = (data: ChartData[], period: number): number[] => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const avg = slice.reduce((sum, item) => sum + item.price, 0) / period;
      result.push(avg);
    }
  }
  return result;
};

export const calculateRSI = (data: ChartData[], period: number = 14): number[] => {
  const prices = data.map((d) => d.price);
  const result: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      result.push(NaN);
      continue;
    }

    let avgGain = 0;
    let avgLoss = 0;

    for (let j = i - period; j < i; j++) {
      const diff = prices[j + 1] - prices[j];
      if (diff > 0) avgGain += diff;
      else avgLoss += Math.abs(diff);
    }

    avgGain /= period;
    avgLoss /= period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    result.push(rsi);
  }

  return result;
};

export const calculateMACD = (
  data: ChartData[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): {
  macd: number[];
  signal: number[];
  histogram: number[];
} => {
  const prices = data.map((d) => d.price);

  const ema = (values: number[], period: number): number[] => {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);

    for (let i = 0; i < values.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else if (i === period - 1) {
        const sma = values.slice(0, period).reduce((a, b) => a + b) / period;
        result.push(sma);
      } else {
        const ema = (values[i] - result[i - 1]) * multiplier + result[i - 1];
        result.push(ema);
      }
    }

    return result;
  };

  const ema12 = ema(prices, fastPeriod);
  const ema26 = ema(prices, slowPeriod);

  const macd = ema12.map((val, i) => {
    if (isNaN(val) || isNaN(ema26[i])) return NaN;
    return val - ema26[i];
  });

  const signal = ema(macd, signalPeriod);

  const histogram = macd.map((val, i) => {
    if (isNaN(val) || isNaN(signal[i])) return NaN;
    return val - signal[i];
  });

  return { macd, signal, histogram };
};

export const calculateBollingerBands = (
  data: ChartData[],
  period: number = 20,
  stdDevMultiplier: number = 2
): {
  upper: number[];
  middle: number[];
  lower: number[];
} => {
  const prices = data.map((d) => d.price);
  const middle: number[] = [];
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      middle.push(NaN);
      upper.push(NaN);
      lower.push(NaN);
    } else {
      const slice = prices.slice(i - period + 1, i + 1);
      const sma = slice.reduce((a, b) => a + b) / period;
      const variance = slice.reduce((sq, n) => sq + Math.pow(n - sma, 2), 0) / period;
      const stdDev = Math.sqrt(variance);

      middle.push(sma);
      upper.push(sma + stdDevMultiplier * stdDev);
      lower.push(sma - stdDevMultiplier * stdDev);
    }
  }

  return { upper, middle, lower };
};

export const calculateATR = (data: any[], period: number = 14): number[] => {
  const result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(NaN);
      continue;
    }

    let sumTR = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const high = data[j].high || data[j].price;
      const low = data[j].low || data[j].price;
      const prevClose = j > 0 ? data[j - 1].price : data[j].price;

      const tr1 = high - low;
      const tr2 = Math.abs(high - prevClose);
      const tr3 = Math.abs(low - prevClose);

      const tr = Math.max(tr1, tr2, tr3);
      sumTR += tr;
    }

    const atr = sumTR / period;
    result.push(atr);
  }

  return result;
};

export const formatTime = (timestamp: number | string): string => {
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
  return date.toLocaleTimeString();
};

export const formatDate = (timestamp: number | string): string => {
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
  return date.toLocaleDateString();
};

export const formatDateTime = (timestamp: number | string): string => {
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
  return date.toLocaleString();
};

export const calculatePnL = (buyPrice: number, sellPrice: number, quantity: number) => {
  const pnl = (sellPrice - buyPrice) * quantity;
  const pnlPercent = ((sellPrice - buyPrice) / buyPrice) * 100;
  return { pnl, pnlPercent };
};

export const calculateDCA = (
  historicalPrices: number[],
  monthlyInvestment: number
): { avgPrice: number; totalInvested: number; totalCoins: number } => {
  let totalInvested = 0;
  let totalCoins = 0;

  historicalPrices.forEach((price) => {
    totalInvested += monthlyInvestment;
    totalCoins += monthlyInvestment / price;
  });

  return {
    avgPrice: totalInvested / totalCoins,
    totalInvested,
    totalCoins,
  };
};

export const validateOrderInput = (
  quantity: number,
  price: number,
  balance: number
): { valid: boolean; error?: string } => {
  if (quantity <= 0) {
    return { valid: false, error: 'Quantity must be greater than 0' };
  }
  if (price <= 0) {
    return { valid: false, error: 'Price must be greater than 0' };
  }
  if (quantity * price > balance) {
    return { valid: false, error: 'Insufficient balance' };
  }
  return { valid: true };
};

export const debounce = <T extends (...args: any[]) => any>(func: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number) => {
  let inThrottle: boolean;
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
};
