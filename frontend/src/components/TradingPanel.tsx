import React, { useState, useEffect } from 'react';
import type { Coin, TradingStrategy } from '../types';
import { StrategyService } from '../services/api';
import { API_BASE_URL } from '../config';
import { formatCurrency, validateOrderInput } from '../utils/helpers';

interface TradingPanelProps {
  symbol: string;
  currentPrice: number;
  balance: number;
  coins?: Coin[];
  onCoinChange?: (coin: Coin) => void;
  onOrderPlaced?: () => void;
}

interface BotStatus {
  botId: string;
  running: boolean;
  paused: boolean;
  executedOrders: number;
  strategyName?: string;
  strategyType?: string;
}

const TradingPanel: React.FC<TradingPanelProps> = ({
  symbol,
  currentPrice,
  balance,
  coins = [],
  onCoinChange,
  onOrderPlaced,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState(symbol);
  const [selectedPrice, setSelectedPrice] = useState(currentPrice);
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderMode, setOrderMode] = useState<'MARKET' | 'LIMIT' | 'STOP_LOSS'>('MARKET');
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>(currentPrice.toString());
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [stopPrice, setStopPrice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'manual' | 'bot'>('manual');
  const [botStrategy, setBotStrategy] = useState<'MANUAL'>('MANUAL');
  const [selectedStrategy, setSelectedStrategy] = useState<TradingStrategy | null>(null);
  const [availableStrategies, setAvailableStrategies] = useState<TradingStrategy[]>([]);
  const [strategySymbolOverride, setStrategySymbolOverride] = useState<string>(''); // Override symbol for custom strategies
  const [botLoading, setBotLoading] = useState(false);
  const [botError, setBotError] = useState<string>('');
  const [activeBots, setActiveBots] = useState<BotStatus[]>([]);
  const [botRefresh, setBotRefresh] = useState(0);
  
  // Manual strategy parameters
  const [manualBuyPrice, setManualBuyPrice] = useState<string>('');
  const [manualSellPrice, setManualSellPrice] = useState<string>('');
  const [manualBuyPercentage, setManualBuyPercentage] = useState<string>('-5');
  const [manualSellPercentage, setManualSellPercentage] = useState<string>('5');

  const handleCoinChange = (newSymbol: string) => {
    const selectedCoin = coins.find(c => c.symbol === newSymbol);
    if (selectedCoin) {
      setSelectedSymbol(selectedCoin.symbol);
      setSelectedPrice(selectedCoin.currentPrice);
      setPrice(selectedCoin.currentPrice.toString());
      setQuantity('');
      onCoinChange?.(selectedCoin);
    }
  };

  useEffect(() => {
    setSelectedSymbol(symbol);
    setSelectedPrice(currentPrice);
    setPrice(currentPrice.toString());
    // Update manual strategy defaults based on current price
    setManualBuyPrice((currentPrice * 0.95).toFixed(2));
    setManualSellPrice((currentPrice * 1.05).toFixed(2));
  }, [symbol, currentPrice]);

  // Fetch available strategies
  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const strategies = await StrategyService.getStrategies();
        setAvailableStrategies(strategies);
        // Auto-select first enabled strategy if available
        const enabledStrategy = strategies.find(s => s.enabled);
        if (enabledStrategy) {
          setSelectedStrategy(enabledStrategy);
        }
      } catch (err) {
        console.error('Failed to fetch strategies:', err);
      }
    };

    fetchStrategies();
    // Refresh strategies every 5 seconds
    const interval = setInterval(fetchStrategies, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchActiveBots = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/demo/bot/active`);
        const data = await response.json();
        if (data.activeBots && Array.isArray(data.activeBots)) {
          const botStatusList = await Promise.all(
            data.activeBots.map(async (botId: string) => {
              try {
                const statusRes = await fetch(`${API_BASE_URL}/demo/bot/status/${botId}`);
                return await statusRes.json();
              } catch {
                return null;
              }
            })
          );
          setActiveBots(botStatusList.filter((b) => b !== null));
        }
      } catch (err) {
        console.error('Failed to fetch bots:', err);
      }
    };

    fetchActiveBots();
    const interval = setInterval(fetchActiveBots, 3000);
    return () => clearInterval(interval);
  }, [botRefresh, selectedSymbol]);

  const handlePlaceOrder = async () => {
    try {
      setError('');
      setSuccess('');

      const qty = parseFloat(quantity);
      const priceVal = parseFloat(price);

      const validation = validateOrderInput(qty, priceVal, balance);
      if (!validation.valid) {
        setError(validation.error || 'Invalid order');
        return;
      }

      // Validate limit and stop prices if applicable
      if (orderMode === 'LIMIT' && !limitPrice) {
        setError('Limit price is required for limit orders');
        return;
      }
      if (orderMode === 'STOP_LOSS' && !stopPrice) {
        setError('Stop price is required for stop-loss orders');
        return;
      }

      setLoading(true);

      const orderData: any = {
        symbol: selectedSymbol,
        type: orderType,
        quantity: qty,
        price: priceVal,
        orderMode: orderMode,
      };

      if (orderMode === 'LIMIT' && limitPrice) {
        orderData.limitPrice = parseFloat(limitPrice);
      }
      if (orderMode === 'STOP_LOSS' && stopPrice) {
        orderData.stopPrice = parseFloat(stopPrice);
      }

      // Use advanced endpoint if not a market order
      const endpoint = orderMode === 'MARKET' 
        ? `${API_BASE_URL}/trading/orders`
        : `${API_BASE_URL}/trading/orders/advanced`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place order');
      }

      await response.json();
      
      const orderModeText = orderMode === 'MARKET' ? '' : ` (${orderMode})`;
      setSuccess(`${orderType}${orderModeText} order placed successfully!`);
      setQuantity('');
      setLimitPrice('');
      setStopPrice('');
      onOrderPlaced?.();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBuy = (percentBalance: number) => {
    const amount = (balance * percentBalance) / 100;
    const qty = amount / selectedPrice;
    setQuantity(qty.toFixed(8));
  };

  const handleStartBot = async () => {
    try {
      setBotError('');
      setBotLoading(true);

      const botId = `bot-${Date.now()}`;
      
      // If user selected a strategy from StrategyManager, use it
      let requestBody: any;
      if (selectedStrategy) {
        // Use symbol override if provided, otherwise use strategy's symbol
        const symbolToUse = strategySymbolOverride || selectedStrategy.symbol || selectedSymbol;
        
        // Map custom strategy types to backend-compatible types
        let backendStrategyType = selectedStrategy.type;
        if (selectedStrategy.type === 'CUSTOM') {
          backendStrategyType = 'MANUAL'; // Backend treats CUSTOM as MANUAL
        }
        
        requestBody = {
          botId,
          strategy: backendStrategyType, // Convert CUSTOM to MANUAL for backend
          strategyId: selectedStrategy.id,
          strategyName: selectedStrategy.name,
          coinId: symbolToUse.toLowerCase(),
          symbol: symbolToUse.toUpperCase(),
          price: selectedPrice,
          parameters: selectedStrategy.parameters,
        };
      } else {
        // Otherwise use built-in strategy
        requestBody = {
          botId,
          strategy: botStrategy,
          coinId: selectedSymbol.toLowerCase(),
          symbol: selectedSymbol.toUpperCase(),
          price: selectedPrice,
        };
        
        // Add manual strategy parameters if MANUAL strategy is selected
        if (botStrategy === 'MANUAL') {
          requestBody.manualParams = {
            buyPrice: parseFloat(manualBuyPrice || '0'),
            sellPrice: parseFloat(manualSellPrice || '0'),
            buyPercentage: parseFloat(manualBuyPercentage || '-5'),
            sellPercentage: parseFloat(manualSellPercentage || '5'),
          };
        }
      }

      const response = await fetch(`${API_BASE_URL}/demo/bot/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (!data.success) {
        setBotError(data.error || 'Failed to start bot');
        return;
      }

      setSuccess(`Bot started with ${selectedStrategy?.name || botStrategy} strategy!`);
      setTimeout(() => setSuccess(''), 3000);
      setBotRefresh((prev) => prev + 1);
      setStrategySymbolOverride(''); // Reset override after bot starts
    } catch (err) {
      setBotError(err instanceof Error ? err.message : 'Failed to start bot');
    } finally {
      setBotLoading(false);
    }
  };

  const handleStopBot = async (botId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/demo/bot/stop/${botId}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('Bot stopped!');
        setTimeout(() => setSuccess(''), 3000);
        setBotRefresh((prev) => prev + 1);
      }
    } catch (err) {
      setBotError(err instanceof Error ? err.message : 'Failed to stop bot');
    }
  };

  const handlePauseBot = async (botId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/demo/bot/pause/${botId}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('Bot paused!');
        setTimeout(() => setSuccess(''), 3000);
        setBotRefresh((prev) => prev + 1);
      }
    } catch (err) {
      setBotError(err instanceof Error ? err.message : 'Failed to pause bot');
    }
  };

  const handleResumeBot = async (botId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/demo/bot/resume/${botId}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('Bot resumed!');
        setTimeout(() => setSuccess(''), 3000);
        setBotRefresh((prev) => prev + 1);
      }
    } catch (err) {
      setBotError(err instanceof Error ? err.message : 'Failed to resume bot');
    }
  };

  const totalValue = parseFloat(quantity || '0') * parseFloat(price || '0');

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '0.75rem',
        padding: '0',
        boxShadow: '0 6px 14px rgba(0,0,0,0.05)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{
        background: '#f8fafc',
        padding: '1.25rem 1.5rem',
        color: '#0f172a',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 0.25rem 0', color: '#0f172a' }}>
              Trading Terminal
            </h2>
            <p style={{ fontSize: '0.95rem', margin: 0, color: '#475569' }}>
              Execute manual trades or deploy automated bots with a clean, focused workspace
            </p>
          </div>
          {coins.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>
                Select coin
              </label>
              <select
                value={selectedSymbol}
                onChange={(e) => handleCoinChange(e.target.value)}
                style={{
                  padding: '0.55rem 0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#0f172a',
                  background: 'white',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                {coins.map((coin) => (
                  <option key={coin.id} value={coin.symbol}>
                    {coin.symbol.toUpperCase()} - {formatCurrency(coin.currentPrice)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: '1.5rem' }}>

      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.75rem',
          background: '#f5f6f8',
          borderRadius: '0.65rem',
          padding: '0.35rem',
          border: '1px solid #e5e7eb'
        }}
      >
        {[
          { id: 'manual', label: 'Manual Trading' },
          { id: 'bot', label: 'Automated Bots' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'manual' | 'bot')}
            style={{
              flex: 1,
              padding: '0.7rem 1rem',
              fontWeight: '700',
              border: activeTab === tab.id ? '1px solid #0f172a' : '1px solid transparent',
              background: activeTab === tab.id ? 'white' : 'transparent',
              color: activeTab === tab.id ? '#0f172a' : '#6b7280',
              cursor: 'pointer',
              fontSize: '0.92rem',
              borderRadius: '0.5rem',
              transition: 'all 0.2s',
              boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Manual Trading Section */}
      {activeTab === 'manual' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem 0' }}>
              Trade {selectedSymbol}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
              Execute spot orders at market or custom prices
            </p>
          </div>

          {/* Order Type Selector */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {(['BUY', 'SELL'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  fontWeight: '700',
                  border: orderType === type ? 'none' : '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  color: orderType === type ? 'white' : '#111827',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  background: orderType === type 
                    ? (type === 'BUY' 
                      ? '#0f766e'
                      : '#b91c1c') 
                    : 'white',
                  transition: 'all 0.2s',
                  boxShadow: orderType === type ? '0 3px 10px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Order Mode Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Order Mode
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {(['MARKET', 'LIMIT', 'STOP_LOSS'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setOrderMode(mode)}
                  style={{
                    padding: '0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: orderMode === mode ? '2px solid #3b82f6' : '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    background: orderMode === mode ? '#eff6ff' : 'white',
                    color: orderMode === mode ? '#1e40af' : '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {mode.replace('_', ' ')}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
              {orderMode === 'MARKET' && 'Execute immediately at current market price'}
              {orderMode === 'LIMIT' && 'Execute only at your specified price or better'}
              {orderMode === 'STOP_LOSS' && 'Sell automatically when price drops to stop price'}
            </p>
          </div>

          {/* Price Input */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
              Price (USD)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
              placeholder="0.00"
              step="0.01"
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              Current: {formatCurrency(selectedPrice)}
            </p>
          </div>

          {/* Limit Price Input (only for LIMIT orders) */}
          {orderMode === 'LIMIT' && (
            <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.25rem' }}>
                Limit Price (USD)
              </label>
              <input
                type="number"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
                placeholder={orderType === 'BUY' ? 'Buy when price drops to...' : 'Sell when price rises to...'}
                step="0.01"
              />
              <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0.35rem 0 0 0' }}>
                {orderType === 'BUY' 
                  ? 'Executes when market price is at or below your limit.'
                  : 'Executes when market price is at or above your limit.'}
              </p>
            </div>
          )}

          {/* Stop Price Input (only for STOP_LOSS orders) */}
          {orderMode === 'STOP_LOSS' && (
            <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#0f172a', marginBottom: '0.25rem' }}>
                Stop Price (USD)
              </label>
              <input
                type="number"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
                placeholder="Sell when price drops to..."
                step="0.01"
              />
              <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0.35rem 0 0 0' }}>
                Executes when market price reaches your stop, for downside protection.
              </p>
            </div>
          )}

          {/* Quantity Input */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
              placeholder="0.00"
              step="0.00000001"
            />
          </div>

          {/* Quick Buy Buttons */}
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>
              Quick Amount
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {[25, 50, 75, 100].map((percent) => (
                <button
                  key={percent}
                  onClick={() => handleQuickBuy(percent)}
                  style={{
                    padding: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                  }}
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>

          {/* Total Value */}
          <div style={{ background: '#f9fafb', borderRadius: '0.375rem', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Value</span>
              <span style={{ fontWeight: '600', color: '#111827' }}>{formatCurrency(totalValue)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Available Balance</span>
              <span
                style={{
                  fontWeight: '600',
                  color: totalValue <= balance ? '#10b981' : '#ef4444',
                }}
              >
                {formatCurrency(balance)}
              </span>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '0.375rem', padding: '0.75rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#b91c1c', margin: 0 }}>{error}</p>
            </div>
          )}

          {success && (
            <div style={{ background: '#ecfdf3', border: '1px solid #bbf7d0', borderRadius: '0.375rem', padding: '0.75rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#166534', margin: 0 }}>{success}</p>
            </div>
          )}

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={loading || !quantity || totalValue === 0}
            style={{
              width: '100%',
              padding: '1rem',
              fontWeight: '700',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: loading || !quantity || totalValue === 0 ? 'not-allowed' : 'pointer',
              background: orderType === 'BUY' ? '#0f766e' : '#b91c1c',
              opacity: loading || !quantity || totalValue === 0 ? 0.55 : 1,
              transition: 'all 0.2s',
              fontSize: '0.95rem',
              boxShadow: (loading || !quantity || totalValue === 0) ? 'none' : '0 3px 10px rgba(0,0,0,0.12)'
            }}
          >
            {loading ? 'Placing order...' : `${orderType} ${selectedSymbol}`}
          </button>

          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '1rem 0 0 0', textAlign: 'center' }}>
            Fees not included. All orders subject to market conditions.
          </p>
        </div>
      )}

      {/* Bot Trading Section */}
      {activeTab === 'bot' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem 0' }}>
              Automated Trading Bots
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
              Deploy bots to trade automatically based on strategies
            </p>
          </div>

          {/* Bot Strategy Selection */}
          <div style={{ 
            background: '#f8fafc', 
            border: '1px solid #e5e7eb', 
            borderRadius: '0.75rem', 
            padding: '1.25rem', 
            marginBottom: '1.5rem',
            boxShadow: '0 3px 10px rgba(0,0,0,0.05)'
          }}>
            <p style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem', margin: 0 }}>
              Start New Bot
            </p>
            
            {/* Show Created Strategies */}
            {availableStrategies.length > 0 && (
              <div style={{ marginBottom: '1rem', marginTop: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                  Select Strategy from StrategyManager
                </label>
                <select
                  value={selectedStrategy?.id || ''}
                  onChange={(e) => {
                    const strategy = availableStrategies.find(s => s.id === e.target.value);
                    setSelectedStrategy(strategy || null);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                    background: 'white',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">-- Select a strategy --</option>
                  {availableStrategies.map((strategy) => (
                    <option key={strategy.id} value={strategy.id}>
                      {strategy.name} ({strategy.type}) - {strategy.symbol} - {strategy.enabled ? '✅ Enabled' : '❌ Disabled'}
                    </option>
                  ))}
                </select>
                {selectedStrategy && (
                  <div style={{ 
                    marginTop: '0.75rem', 
                    padding: '0.875rem', 
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <p style={{ fontSize: '0.875rem', color: '#0f172a', margin: 0, fontWeight: '700' }}>
                      {selectedStrategy.name} - {selectedStrategy.type}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.25rem', marginBottom: 0 }}>
                      Symbol: {selectedStrategy.symbol || 'Not set'} | Status: {selectedStrategy.enabled ? 'Active' : 'Inactive'}
                    </p>
                    {selectedStrategy.parameters && (
                      <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.5rem', marginBottom: 0 }}>
                        Parameters: {JSON.stringify(selectedStrategy.parameters).substring(0, 100)}...
                      </p>
                    )}
                    {!selectedStrategy.symbol && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
                          Select coin for this strategy
                        </label>
                        <select
                          value={strategySymbolOverride}
                          onChange={(e) => setStrategySymbolOverride(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '0.375rem',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            boxSizing: 'border-box',
                            background: 'white',
                            color: '#0f172a'
                          }}
                        >
                          <option value="">-- Select a coin --</option>
                          {coins.map((coin) => (
                            <option key={coin.id} value={coin.symbol}>
                              {coin.symbol.toUpperCase()} - {coin.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Fallback: Built-in Strategies */}
            <div style={{ marginTop: availableStrategies.length > 0 ? '1rem' : '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                {availableStrategies.length > 0 ? 'Or use built-in strategy' : 'Built-in strategies'}
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <select
                  value={botStrategy}
                  onChange={(e) => setBotStrategy(e.target.value as 'MANUAL')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <option value="MANUAL">Manual strategy (custom conditions)</option>
                </select>
                <button
                  onClick={handleStartBot}
                  disabled={botLoading || Boolean(selectedStrategy && !selectedStrategy.symbol && !strategySymbolOverride)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: (botLoading || (selectedStrategy && !selectedStrategy.symbol && !strategySymbolOverride))
                      ? '#cbd5e1' 
                      : '#0f766e',
                    color: 'white',
                    fontWeight: '700',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: (botLoading || (selectedStrategy && !selectedStrategy.symbol && !strategySymbolOverride)) ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    boxShadow: (botLoading || (selectedStrategy && !selectedStrategy.symbol && !strategySymbolOverride)) ? 'none' : '0 3px 10px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s'
                  }}
                >
                  {botLoading ? 'Starting...' : 'Start Bot'}
                </button>
              </div>
            </div>

            {/* Strategy Description */}
            <div style={{ fontSize: '0.75rem', color: '#1f2937' }}>
              <div>
                <p style={{ margin: '0 0 0.75rem 0' }}>
                  <strong>Manual strategy:</strong> Set custom price targets and percentage changes. Bot executes automatically when conditions are met.
                </p>
                {/* Manual Strategy Inputs */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '0.75rem',
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    background: 'white',
                    borderRadius: '0.375rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                        Buy Price (USD)
                      </label>
                      <input
                        type="number"
                        value={manualBuyPrice}
                        onChange={(e) => setManualBuyPrice(e.target.value)}
                        placeholder="e.g., 82000"
                        step="0.01"
                        style={{
                          width: '100%',
                          padding: '0.375rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                        Sell Price (USD)
                      </label>
                      <input
                        type="number"
                        value={manualSellPrice}
                        onChange={(e) => setManualSellPrice(e.target.value)}
                        placeholder="e.g., 92000"
                        step="0.01"
                        style={{
                          width: '100%',
                          padding: '0.375rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                        Buy % Change
                      </label>
                      <input
                        type="number"
                        value={manualBuyPercentage}
                        onChange={(e) => setManualBuyPercentage(e.target.value)}
                        placeholder="e.g., -5"
                        step="0.1"
                        style={{
                          width: '100%',
                          padding: '0.375rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                        Sell % Change
                      </label>
                      <input
                        type="number"
                        value={manualSellPercentage}
                        onChange={(e) => setManualSellPercentage(e.target.value)}
                        placeholder="e.g., 5"
                        step="0.1"
                        style={{
                          width: '100%',
                          padding: '0.375rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                  <p style={{ fontSize: '0.65rem', color: '#6b7280', margin: '0.5rem 0 0 0', fontStyle: 'italic' }}>
                    Current price: {formatCurrency(selectedPrice)} • Bot triggers when target price OR percentage change is met
                  </p>
                </div>
            </div>
          </div>

          {/* Error Message */}
          {botError && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.375rem', padding: '0.75rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#991b1b', margin: 0 }}>{botError}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={{ background: '#ecfdf3', border: '1px solid #bbf7d0', borderRadius: '0.375rem', padding: '0.75rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#166534', margin: 0 }}>{success}</p>
            </div>
          )}

          {/* Active Bots List */}
          {activeBots.length > 0 ? (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1rem' 
              }}>
                <p style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Active Bots
                </p>
                <span style={{
                  background: '#f1f5f9',
                  color: '#0f172a',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  border: '1px solid #e2e8f0'
                }}>
                  {activeBots.length} running
                </span>
              </div>
              {activeBots.map((bot) => (
                <div
                  key={bot.botId}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    background: 'white',
                    marginBottom: '1rem',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.05)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '700', color: '#0f172a', margin: 0, fontSize: '0.95rem' }}>
                        {bot.botId}
                      </p>
                      {/* Display Strategy Information */}
                      {bot.strategyName && (
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: '#f8fafc',
                          borderRadius: '0.375rem',
                          display: 'inline-block',
                          border: '1px solid #e2e8f0'
                        }}>
                          <p style={{ fontSize: '0.8rem', color: '#0f172a', margin: 0, fontWeight: '700' }}>
                            Strategy: {bot.strategyName} ({bot.strategyType || 'N/A'})
                          </p>
                        </div>
                      )}
                      <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                        Status:{' '}
                        <span
                          style={{
                            fontWeight: '700',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            background: bot.running 
                              ? (bot.paused ? '#fff7ed' : '#ecfdf3') 
                              : '#fef2f2',
                            color: bot.running 
                              ? (bot.paused ? '#c2410c' : '#166534') 
                              : '#b91c1c',
                          }}
                        >
                          {bot.running ? (bot.paused ? 'Paused' : 'Running') : 'Stopped'}
                        </span>
                      </p>
                      <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem', marginBottom: 0 }}>
                        Orders Executed: <span style={{ fontWeight: '700', color: '#667eea' }}>{bot.executedOrders}</span>
                      </p>
                    </div>

                    {/* Control Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                      {bot.running && (
                        <>
                          {bot.paused ? (
                            <button
                              onClick={() => handleResumeBot(bot.botId)}
                              style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                background: '#0f766e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                transition: 'all 0.2s'
                              }}
                            >
                                Resume
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePauseBot(bot.botId)}
                              style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                  background: '#ca8a04',
                                  color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                  transition: 'all 0.2s'
                              }}
                            >
                                Pause
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => handleStopBot(bot.botId)}
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                            background: '#b91c1c',
                            color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                            transition: 'all 0.2s'
                        }}
                      >
                          Stop
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#6b7280',
                fontSize: '0.875rem',
              }}
            >
              No active bots. Start one above!
            </div>
          )}

          {/* Features Info */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              boxShadow: '0 3px 10px rgba(0,0,0,0.05)'
            }}
          >
            <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem', margin: 0 }}>
              Java OOP concepts demonstrated
            </p>
            <ul style={{ fontSize: '0.82rem', color: '#475569', margin: '0.75rem 0 0 0', paddingLeft: '1.25rem', lineHeight: '1.6' }}>
              <li><strong>Multi-Threading</strong> (Thread.start, stop, sleep)</li>
              <li><strong>Synchronization</strong> (wait/notify pattern)</li>
              <li><strong>Locks</strong> (ReentrantLock, ReadWriteLock)</li>
              <li><strong>Inheritance & Polymorphism</strong></li>
              <li><strong>Generics</strong> with Type Parameters</li>
              <li><strong>Custom Exception Handling</strong></li>
            </ul>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default TradingPanel;
