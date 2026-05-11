import React, { useState, useEffect } from 'react';
import type { Order, Trade } from '../types';
import { TradingService } from '../services/api';
import { API_BASE_URL } from '../config';
import { formatDate } from '../utils/helpers';

const OrderBook: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'trades' | 'stats'>('orders');
  const [loading, setLoading] = useState(false);
  const [orderStats, setOrderStats] = useState<any>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [symbolFilter, setSymbolFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, trades, statusFilter, typeFilter, symbolFilter, searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, tradesData, statsData] = await Promise.all([
        TradingService.getOrders(),
        TradingService.getTrades(),
        fetchOrderStats(),
      ]);
      setOrders(ordersData);
      setTrades(tradesData);
      setOrderStats(statsData);
    } catch (error) {
      console.error('Error fetching order book data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/trading/orders/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return null;
    }
  };

  const applyFilters = () => {
    // Filter orders
    let filtered = [...orders];
    
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }
    
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(o => o.type === typeFilter);
    }
    
    if (symbolFilter !== 'ALL') {
      filtered = filtered.filter(o => o.symbol === symbolFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(o => 
        o.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.toString().includes(searchQuery)
      );
    }
    
    setFilteredOrders(filtered);

    // Filter trades
    let filteredTradesData = [...trades];
    if (symbolFilter !== 'ALL') {
      filteredTradesData = filteredTradesData.filter(t => t.symbol === symbolFilter);
    }
    if (typeFilter !== 'ALL') {
      filteredTradesData = filteredTradesData.filter(t => t.type === typeFilter);
    }
    if (searchQuery) {
      filteredTradesData = filteredTradesData.filter(t => 
        t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredTrades(filteredTradesData);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await TradingService.cancelOrder(orderId);
      fetchData();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    }
  };

  const clearFilters = () => {
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setSymbolFilter('ALL');
    setSearchQuery('');
  };

  // Get unique symbols for filter
  const uniqueSymbols = Array.from(new Set([...orders.map(o => o.symbol), ...trades.map(t => t.symbol)]));

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '2rem'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '800', 
          color: '#0f172a',
          marginBottom: '0.5rem'
        }}>
          Order Book & Trade History
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
          Track your orders, trades, and execution statistics in real-time
        </p>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.25rem', 
        marginBottom: '2rem',
        background: '#f9fafb',
        padding: '0.375rem',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        {(['orders', 'trades', 'stats'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: activeTab === tab ? 'white' : 'transparent',
              color: activeTab === tab ? '#0f172a' : '#6b7280',
              fontWeight: activeTab === tab ? '700' : '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderRadius: '8px',
              boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {tab === 'orders' ? 'Open Orders' : tab === 'trades' ? 'Trade History' : 'Statistics'}
          </button>
        ))}
      </div>

      {/* Filters */}
      {(activeTab === 'orders' || activeTab === 'trades') && (
        <div style={{
          marginBottom: '2rem',
          background: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            {activeTab === 'orders' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value='ALL'>All Status</option>
                  <option value='PENDING'>Pending</option>
                  <option value='FILLED'>Filled</option>
                  <option value='CANCELLED'>Cancelled</option>
                  <option value='PARTIALLY_FILLED'>Partially Filled</option>
                </select>
              </div>
            )}
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value='ALL'>All Types</option>
                <option value='BUY'>Buy</option>
                <option value='SELL'>Sell</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Symbol</label>
              <select
                value={symbolFilter}
                onChange={(e) => setSymbolFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value='ALL'>All Symbols</option>
                {uniqueSymbols.map(symbol => (
                  <option key={symbol} value={symbol}>{symbol}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Search</label>
              <input
                type='text'
                placeholder='Symbol or Order ID'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={clearFilters}
              style={{
                padding: '0.5rem 1rem',
                background: '#0f172a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 10px rgba(0,0,0,0.12)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: '#f8fafc',
          borderRadius: '12px'
        }}>
          <p style={{ color: '#6b7280' }}>Loading...</p>
        </div>
      )}

      {/* Orders Table */}
      {activeTab === 'orders' && (
        <div style={{ overflowX: 'auto' }}>
          {filteredOrders.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '1.75rem',
              background: '#f8fafc',
              borderRadius: '10px',
              color: '#6b7280',
              border: '1px solid #e5e7eb'
            }}>
              {orders.length === 0 ? 'No orders placed yet' : 'No orders match the filters'}
            </div>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
              boxShadow: '0 6px 16px rgba(0,0,0,0.06)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                    <th style={{ padding: '1rem 1rem', textAlign: 'left', fontWeight: '700', color: '#1f2937', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>ID</th>
                    <th style={{ padding: '1rem 1rem', textAlign: 'left', fontWeight: '700', color: '#1f2937', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Symbol</th>
                    <th style={{ padding: '1rem 1rem', textAlign: 'left', fontWeight: '700', color: '#1f2937', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Type</th>
                    <th style={{ padding: '1rem 1rem', textAlign: 'left', fontWeight: '700', color: '#1f2937', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Mode</th>
                    <th style={{ padding: '1rem 1rem', textAlign: 'right', fontWeight: '700', color: '#1f2937', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Price</th>
                    <th style={{ padding: '1rem 1rem', textAlign: 'right', fontWeight: '700', color: '#1f2937', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Quantity</th>
                    <th style={{ padding: '1rem 1rem', textAlign: 'right', fontWeight: '700', color: '#1f2937', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Total</th>
                    <th style={{ padding: '1rem 1rem', textAlign: 'center', fontWeight: '700', color: '#1f2937', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '1rem 1rem', textAlign: 'center', fontWeight: '700', color: '#1f2937', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: '1px solid #f0f1f3',
                        background: index % 2 === 0 ? 'white' : '#fafbfc',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f0f6ff';
                        e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(15,23,42,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafbfc';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <td style={{ padding: '1rem 1rem', fontSize: '0.9rem', color: '#9ca3af', fontWeight: '500' }}>{order.id}</td>
                      <td style={{ padding: '1rem 1rem', fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{order.symbol}</td>
                      <td style={{ padding: '1rem 1rem' }}>
                        <span style={{
                          padding: '0.375rem 0.8rem',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          borderRadius: '8px',
                          background: order.type === 'BUY' ? '#d1fae5' : '#fee2e2',
                          color: order.type === 'BUY' ? '#065f46' : '#7f1d1d'
                        }}>
                          {order.type}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1rem', fontSize: '0.9rem', color: '#6b7280', fontWeight: '500' }}>
                        {(order as Order & { orderMode?: string }).orderMode || 'MARKET'}
                      </td>
                      <td style={{ padding: '1rem 1rem', textAlign: 'right', fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>
                        ${order.price.toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem 1rem', textAlign: 'right', color: '#6b7280', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                        {order.quantity.toFixed(8)}
                      </td>
                      <td style={{ padding: '1rem 1rem', textAlign: 'right', fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>
                        ${(order.quantity * order.price).toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem 1rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.375rem 0.8rem',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          borderRadius: '8px',
                          background: order.status === 'PENDING' ? '#fef3c7' : order.status === 'FILLED' ? '#d1fae5' : order.status === 'CANCELLED' ? '#f3f4f6' : '#dbeafe',
                          color: order.status === 'PENDING' ? '#78350f' : order.status === 'FILLED' ? '#065f46' : order.status === 'CANCELLED' ? '#4b5563' : '#1e40af'
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1rem', textAlign: 'center' }}>
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            style={{
                              color: '#ef4444',
                              background: 'transparent',
                              border: '1px solid #fecaca',
                              fontWeight: '600',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '6px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#dc2626';
                              e.currentTarget.style.background = '#fef2f2';
                              e.currentTarget.style.borderColor = '#fca5a5';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#ef4444';
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.borderColor = '#fecaca';
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Trades Table */}
      {activeTab === 'trades' && (
        <div style={{ overflowX: 'auto' }}>
          {filteredTrades.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '1.75rem',
              background: '#f8fafc',
              borderRadius: '10px',
              color: '#6b7280',
              border: '1px solid #e5e7eb'
            }}>
              {trades.length === 0 ? 'No trade history yet' : 'No trades match the filters'}
            </div>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
              boxShadow: '0 6px 16px rgba(0,0,0,0.06)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                    <th style={{ padding: '1rem 1rem', textAlign: 'left', fontWeight: '700', color: '#1f2937', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>ID</th>
                    <th style={{ padding: '1rem 1rem', textAlign: 'left', fontWeight: '700', color: '#1f2937', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Symbol</th>
                    <th style={{ padding: '1rem 1rem', textAlign: 'left', fontWeight: '700', color: '#1f2937', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Type</th>
                    <th style={{ padding: '1rem 1rem', textAlign: 'right', fontWeight: '700', color: '#1f2937', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Price</th>
                    <th style={{ padding: '1rem 1rem', textAlign: 'right', fontWeight: '700', color: '#1f2937', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Quantity</th>
                    <th style={{ padding: '1rem 1rem', textAlign: 'right', fontWeight: '700', color: '#1f2937', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Total</th>
                    <th style={{ padding: '1rem 1rem', textAlign: 'left', fontWeight: '700', color: '#1f2937', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.map((trade, index) => (
                    <tr
                      key={trade.id}
                      style={{
                        borderBottom: '1px solid #f0f1f3',
                        background: index % 2 === 0 ? 'white' : '#fafbfc',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f0f6ff';
                        e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(15,23,42,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafbfc';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <td style={{ padding: '1rem 1rem', fontSize: '0.9rem', color: '#9ca3af', fontWeight: '500' }}>{trade.id}</td>
                      <td style={{ padding: '1rem 1rem', fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{trade.symbol}</td>
                      <td style={{ padding: '1rem 1rem' }}>
                        <span style={{
                          padding: '0.375rem 0.8rem',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          borderRadius: '8px',
                          background: trade.type === 'BUY' ? '#d1fae5' : '#fee2e2',
                          color: trade.type === 'BUY' ? '#065f46' : '#7f1d1d'
                        }}>
                          {trade.type}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1rem', textAlign: 'right', fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>
                        ${trade.price.toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem 1rem', textAlign: 'right', color: '#6b7280', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                        {trade.quantity.toFixed(8)}
                      </td>
                      <td style={{ padding: '1rem 1rem', textAlign: 'right', fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>
                        ${trade.totalValue.toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem 1rem', textAlign: 'left', color: '#6b7280', fontSize: '0.9rem' }}>
                        {formatDate(trade.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && orderStats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}>
          {[
            { label: 'Total Orders', value: orderStats.totalOrders || 0 },
            { label: 'Pending Orders', value: orderStats.pending || 0 },
            { label: 'Filled Orders', value: orderStats.filled || 0 },
            { label: 'Cancelled Orders', value: orderStats.cancelled || 0 },
            { label: 'Fill Rate', value: `${(orderStats.fillRate || 0).toFixed(1)}%` },
            { label: 'Total Trades', value: trades.length }
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'white',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                padding: '1.25rem',
                boxShadow: '0 6px 16px rgba(0,0,0,0.06)'
              }}
            >
              <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', margin: 0 }}>{stat.label}</p>
              <p style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', margin: '0.35rem 0 0' }}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderBook;
