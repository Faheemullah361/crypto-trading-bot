import React, { useState, useEffect } from 'react';
import type { TradingStrategy, StrategyParams } from '../types';
import { StrategyService } from '../services/api';
import { formatPercent } from '../utils/helpers';

const StrategyManager: React.FC = () => {
  const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<
    'MANUAL' | 'CUSTOM'
  >('MANUAL');
  const [formData, setFormData] = useState({
    name: '',
    symbol: '', // Optional - can select at bot runtime
    parameters: {} as StrategyParams,
  });

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      setLoading(true);
      const data = await StrategyService.getStrategies();
      setStrategies(data);
    } catch (error) {
      console.error('Error fetching strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStrategy = async () => {
    try {
      setLoading(true);
      await StrategyService.createStrategy({
        name: formData.name,
        symbol: formData.symbol,
        enabled: false,
        type: selectedType,
        parameters: formData.parameters,
        performance: {
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          winRate: 0,
          totalPnL: 0,
          maxDrawdown: 0,
          profitFactor: 0,
        },
      });
      fetchStrategies();
      setShowForm(false);
      setFormData({ name: '', symbol: '', parameters: {} });
    } catch (error) {
      console.error('Error creating strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStrategy = async (id: string, enabled: boolean) => {
    try {
      await StrategyService.updateStrategy(id, { enabled: !enabled });
      fetchStrategies();
    } catch (error) {
      console.error('Error toggling strategy:', error);
    }
  };

  const handleDeleteStrategy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this strategy?')) return;
    try {
      await StrategyService.deleteStrategy(id);
      fetchStrategies();
    } catch (error) {
      console.error('Error deleting strategy:', error);
    }
  };

  const handleEditStrategy = (strategy: TradingStrategy) => {
    setEditingId(strategy.id);
    setSelectedType(strategy.type as any);
    setFormData({
      name: strategy.name,
      symbol: strategy.symbol,
      parameters: strategy.parameters || {},
    });
    setShowForm(true);
  };

  const handleUpdateStrategy = async () => {
    if (!editingId) return;
    try {
      setLoading(true);
      await StrategyService.updateStrategy(editingId, {
        name: formData.name,
        symbol: formData.symbol,
        type: selectedType,
        parameters: formData.parameters,
      });
      fetchStrategies();
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', symbol: '', parameters: {} });
    } catch (error) {
      console.error('Error updating strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStrategyForm = () => {
    switch (selectedType) {
      case 'MANUAL':
        return (
          <>
            <div style={{ gridColumn: 'span 2', background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '0.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: '600', marginBottom: '0.25rem' }}>
                Manual Trading Strategy
              </p>
              <p style={{ fontSize: '0.75rem', color: '#1e3a8a' }}>
                Set custom price targets or percentage changes. When conditions are met, the bot will automatically buy or sell.
              </p>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Buy at Price (USD)
              </label>
              <input
                type='number'
                step='0.01'
                placeholder='e.g., 40000'
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parameters: {
                      ...formData.parameters,
                      buyPriceThreshold: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Leave empty to disable</p>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Sell at Price (USD)
              </label>
              <input
                type='number'
                step='0.01'
                placeholder='e.g., 50000'
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parameters: {
                      ...formData.parameters,
                      sellPriceThreshold: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Leave empty to disable</p>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Buy on Drop (%)
              </label>
              <input
                type='number'
                step='0.1'
                placeholder='e.g., 5'
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parameters: {
                      ...formData.parameters,
                      buyPercentageChange: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Buy when price drops by this %</p>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Sell on Rise (%)
              </label>
              <input
                type='number'
                step='0.1'
                placeholder='e.g., 10'
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parameters: {
                      ...formData.parameters,
                      sellPercentageChange: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Sell when price rises by this %</p>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Max Trade Size (%)
              </label>
              <input
                type='number'
                defaultValue='10'
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parameters: {
                      ...formData.parameters,
                      maxTradeSize: parseInt(e.target.value),
                    },
                  })
                }
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Stop Loss (%)
              </label>
              <input
                type='number'
                defaultValue='5'
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parameters: {
                      ...formData.parameters,
                      stopLoss: parseInt(e.target.value),
                    },
                  })
                }
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}
              />
            </div>
          </>
        );
      case 'CUSTOM':
        return (
          <>
            <div style={{ gridColumn: 'span 2', background: '#faf5ff', border: '1px solid #c084fc', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '0.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#7e22ce', fontWeight: '600', marginBottom: '0.25rem' }}>
                Custom Strategy
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6b21a8' }}>
                Define your own conditions and rules for buying/selling
              </p>
            </div>
            
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Strategy Name
              </label>
              <input
                type='text'
                placeholder='e.g., My Custom Bot'
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parameters: {
                      ...formData.parameters,
                      customName: e.target.value,
                    },
                  })
                }
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Buy Condition
              </label>
              <textarea
                placeholder='e.g., price drops below 24h low'
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parameters: {
                      ...formData.parameters,
                      buyCondition: e.target.value,
                    },
                  })
                }
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                rows={2}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Sell Condition
              </label>
              <textarea
                placeholder='e.g., price rises above 24h high'
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parameters: {
                      ...formData.parameters,
                      sellCondition: e.target.value,
                    },
                  })
                }
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                rows={2}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Max Trade Size (%)
              </label>
              <input
                type='number'
                defaultValue='10'
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parameters: {
                      ...formData.parameters,
                      maxTradeSize: parseInt(e.target.value),
                    },
                  })
                }
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Stop Loss (%)
              </label>
              <input
                type='number'
                defaultValue='5'
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parameters: {
                      ...formData.parameters,
                      stopLoss: parseInt(e.target.value),
                    },
                  })
                }
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Section */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.75rem',
        color: '#0f172a',
        boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0 0 0.35rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
          Trading Strategy Manager
        </h2>
        <p style={{ fontSize: '0.95rem', margin: 0, color: '#475569' }}>
          Create, manage, and deploy automated trading strategies with clear controls
        </p>
      </div>

      {/* Create Strategy Form */}
      {showForm && (
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 6px 16px rgba(0,0,0,0.06)', 
          padding: '1.75rem',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {editingId ? 'Edit Trading Strategy' : 'Create New Strategy'}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({ name: '', symbol: '', parameters: {} });
              }}
              style={{
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                fontSize: '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1rem', 
            marginBottom: '1rem' 
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Strategy Name
              </label>
              <input
                type='text'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                style={{ 
                  width: '100%', 
                  padding: '0.5rem 0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                placeholder='e.g., Bitcoin RSI'
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Coin Symbol <span style={{ color: '#9ca3af' }}>(Optional - select at bot runtime)</span>
              </label>
              <input
                type='text'
                value={formData.symbol}
                onChange={(e) =>
                  setFormData({ ...formData, symbol: e.target.value })
                }
                style={{ 
                  width: '100%', 
                  padding: '0.5rem 0.75rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                placeholder='e.g., BTC, ETH (leave empty to choose later)'
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Strategy Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'MANUAL' | 'CUSTOM')}
              style={{ 
                width: '100%', 
                padding: '0.5rem 0.75rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                background: 'white'
              }}
            >
              <option value='MANUAL'>Manual (Custom Conditions)</option>
              <option value='CUSTOM'>Custom</option>
            </select>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1rem', 
            marginBottom: '1.5rem' 
          }}>
            {getStrategyForm()}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              onClick={editingId ? handleUpdateStrategy : handleCreateStrategy}
              disabled={loading || !formData.name}
              style={{ 
                flex: 1, 
                background: loading || !formData.name ? '#e2e8f0' : '#0f172a', 
                color: loading || !formData.name ? '#94a3b8' : 'white', 
                padding: '0.875rem 1.5rem', 
                borderRadius: '0.5rem', 
                fontWeight: '700',
                border: loading || !formData.name ? '1px solid #e2e8f0' : '1px solid #0f172a',
                cursor: loading || !formData.name ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
                boxShadow: loading || !formData.name ? 'none' : '0 4px 10px rgba(0,0,0,0.12)',
                transition: 'all 0.2s'
              }}
            >
              {loading ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Strategy' : 'Create Strategy')}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({ name: '', symbol: '', parameters: {} });
              }}
              style={{ 
                flex: 1, 
                background: 'white',
                border: '1px solid #e5e7eb',
                color: '#0f172a', 
                padding: '0.875rem 1.5rem', 
                borderRadius: '0.5rem', 
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.95rem',
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Strategies List */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 6px 16px rgba(0,0,0,0.06)', 
        padding: '1.75rem',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Your Strategies</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              {strategies.length} {strategies.length === 1 ? 'strategy' : 'strategies'} configured
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ 
              background: '#0f172a', 
              color: 'white', 
              padding: '0.7rem 1.4rem', 
              borderRadius: '0.5rem', 
              fontWeight: '700',
              border: '1px solid #0f172a',
              cursor: 'pointer',
              fontSize: '0.95rem',
              boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
              transition: 'all 0.2s'
            }}
          >
            New Strategy
          </button>
        </div>

        {strategies.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px dashed #e2e8f0'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
              No strategies yet
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Create your first automated trading strategy to get started
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{ 
                background: '#0f172a', 
                color: 'white', 
                padding: '0.7rem 1.4rem', 
                borderRadius: '0.5rem', 
                fontWeight: '700',
                border: '1px solid #0f172a',
                cursor: 'pointer',
                fontSize: '0.95rem',
                boxShadow: '0 4px 10px rgba(0,0,0,0.12)'
              }}
            >
              Create First Strategy
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '1.25rem' 
          }}>
            {strategies.map((strategy) => (
              <div
                key={strategy.id}
                style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px', 
                  padding: '1.35rem',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  background: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 18px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Strategy Type Badge */}
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: strategy.enabled ? '#ecfdf3' : '#f1f5f9',
                  color: strategy.enabled ? '#166534' : '#475569',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  border: '1px solid #e2e8f0'
                }}>
                  {strategy.enabled ? 'Active' : 'Inactive'}
                </div>
                <div style={{ marginBottom: '1rem', paddingTop: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                    {strategy.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ 
                      background: '#f1f5f9',
                      color: '#0f172a',
                      padding: '0.25rem 0.7rem',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      border: '1px solid #e2e8f0'
                    }}>
                      {strategy.symbol}
                    </span>
                    <span style={{ 
                      background: '#f8fafc',
                      color: '#475569',
                      padding: '0.25rem 0.7rem',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      border: '1px solid #e2e8f0'
                    }}>
                      {strategy.type}
                    </span>
                  </div>
                </div>

                <div style={{ 
                  background: '#f8fafc',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '1rem',
                    fontSize: '0.875rem'
                  }}>
                    <div>
                      <p style={{ color: '#6b7280', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Win Rate</p>
                      <p style={{ fontWeight: '700', color: '#0f766e', fontSize: '1.1rem', margin: 0 }}>
                        {formatPercent(strategy.performance.winRate, 1)}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: '#6b7280', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total P&L</p>
                      <p style={{ 
                        fontWeight: '700', 
                        color: strategy.performance.totalPnL >= 0 ? '#0f766e' : '#b91c1c',
                        fontSize: '1.1rem',
                        margin: 0
                      }}>
                        ${strategy.performance.totalPnL.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: '#6b7280', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Trades</p>
                      <p style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.1rem', margin: 0 }}>
                        {strategy.performance.totalTrades}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: '#6b7280', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Drawdown</p>
                      <p style={{ fontWeight: '700', color: '#b91c1c', fontSize: '1.1rem', margin: 0 }}>
                        {formatPercent(strategy.performance.maxDrawdown, 1)}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() =>
                      handleToggleStrategy(strategy.id, strategy.enabled)
                    }
                    style={{ 
                      flex: 1,
                      background: strategy.enabled ? '#f8fafc' : '#0f172a',
                      color: strategy.enabled ? '#0f172a' : 'white',
                      fontSize: '0.8rem', 
                      fontWeight: '700',
                      border: strategy.enabled ? '1px solid #e5e7eb' : '1px solid #0f172a',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      padding: '0.65rem',
                      transition: 'all 0.2s',
                      boxShadow: strategy.enabled ? 'none' : '0 4px 10px rgba(0,0,0,0.12)'
                    }}
                  >
                    {strategy.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button 
                    onClick={() => handleEditStrategy(strategy)}
                    style={{ 
                      background: 'white',
                      color: '#0f172a',
                      fontSize: '0.8rem', 
                      fontWeight: '700',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      padding: '0.65rem 1rem',
                      transition: 'all 0.2s'
                    }}>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStrategy(strategy.id)}
                    style={{ 
                      background: '#fff1f2',
                      color: '#b91c1c',
                      fontSize: '0.8rem', 
                      fontWeight: '700',
                      border: '1px solid #fecdd3',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      padding: '0.65rem 1rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyManager;
