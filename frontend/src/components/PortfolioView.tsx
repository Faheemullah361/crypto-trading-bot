import React, { useState, useEffect } from 'react';
import type { Portfolio } from '../types';
import { TradingService } from '../services/api';
import { formatCurrency, formatPercent } from '../utils/helpers';

const PortfolioView: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const rawData = await TradingService.getPortfolio();
      
      // Transform backend data to match frontend interface
      const transformedPortfolio: Portfolio = {
        totalBalance: rawData.totalBalance || 0,
        totalInvested: rawData.totalInvested || 0,
        totalPnL: rawData.totalPnL || 0,
        totalPnLPercent: rawData.totalInvested > 0 ? (rawData.totalPnL / rawData.totalInvested) * 100 : 0,
        holdings: rawData.holdings ? Object.entries(rawData.holdings).map(([symbol, holding]: any) => ({
          symbol,
          quantity: holding.quantity || 0,
          averagePrice: holding.avgPrice || 0,
          currentPrice: holding.lastPrice || 0,
          totalValue: (holding.quantity || 0) * (holding.lastPrice || 0),
          pnl: (holding.quantity || 0) * ((holding.lastPrice || 0) - (holding.avgPrice || 0)),
          pnlPercent: holding.avgPrice > 0 ? (((holding.lastPrice || 0) - (holding.avgPrice || 0)) / (holding.avgPrice || 0)) * 100 : 0,
          percentageOfPortfolio: rawData.totalInvested > 0 ? ((holding.quantity || 0) * (holding.lastPrice || 0) / rawData.totalInvested) * 100 : 0
        })) : [],
        trades: []
      };
      
      setPortfolio(transformedPortfolio);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !portfolio) {
    return (
      <div style={{ 
        minHeight: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8fafc',
        borderRadius: '12px',
        color: '#0f172a',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid rgba(15,23,42,0.08)',
            borderTop: '4px solid #0f172a',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ fontSize: '1.05rem', fontWeight: '600', color: '#334155' }}>Loading portfolio...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div style={{
        background: '#f8fafc',
        borderRadius: '12px',
        padding: '2.5rem',
        textAlign: 'center',
        color: '#0f172a',
        border: '1px solid #e5e7eb'
      }}>
        <p style={{ fontSize: '1.15rem', fontWeight: '700', color: '#334155' }}>No portfolio data available</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '800', 
            color: '#0f172a',
            marginBottom: '0.4rem'
          }}>
            Portfolio Dashboard
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Real-time portfolio tracking • Updated every 5 seconds
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '0.5rem 1rem',
              background: viewMode === 'grid' ? '#0f172a' : 'white',
              color: viewMode === 'grid' ? 'white' : '#0f172a',
              border: viewMode === 'grid' ? '1px solid #0f172a' : '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'all 0.2s'
            }}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '0.5rem 1rem',
              background: viewMode === 'list' ? '#0f172a' : 'white',
              color: viewMode === 'list' ? 'white' : '#0f172a',
              border: viewMode === 'list' ? '1px solid #0f172a' : '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'all 0.2s'
            }}
          >
            List View
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Total Balance Card */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          color: '#0f172a',
          border: '1px solid #e5e7eb',
          boxShadow: '0 6px 16px rgba(0,0,0,0.05)'
        }}
        >
          <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>Total Balance</p>
          <p style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.35rem', color: '#0f172a' }}>
            {formatCurrency(portfolio.totalBalance)}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Available cash</p>
        </div>

        {/* Total Invested Card */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          color: '#0f172a',
          border: '1px solid #e5e7eb',
          boxShadow: '0 6px 16px rgba(0,0,0,0.05)'
        }}
        >
          <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>Total Invested</p>
          <p style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.35rem', color: '#0f172a' }}>
            {formatCurrency(portfolio.totalInvested)}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Capital deployed</p>
        </div>

        {/* Total P&L Card */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          color: '#0f172a',
          border: '1px solid #e5e7eb',
          boxShadow: '0 6px 16px rgba(0,0,0,0.05)'
        }}
        >
          <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>Total P&L</p>
          <p style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.35rem', color: portfolio.totalPnL >= 0 ? '#0f766e' : '#b91c1c' }}>
            {portfolio.totalPnL >= 0 ? '+' : ''}{formatCurrency(portfolio.totalPnL)}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
            {portfolio.totalPnL >= 0 ? 'Profit' : 'Loss'}
          </p>
        </div>

        {/* P&L % Card */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          color: '#0f172a',
          border: '1px solid #e5e7eb',
          boxShadow: '0 6px 16px rgba(0,0,0,0.05)'
        }}
        >
          <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>P&L Percentage</p>
          <p style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.35rem', color: portfolio.totalPnLPercent >= 0 ? '#0f766e' : '#b91c1c' }}>
            {portfolio.totalPnLPercent >= 0 ? '+' : ''}{formatPercent(portfolio.totalPnLPercent)}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Return rate</p>
        </div>
      </div>

      {/* Holdings */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '800', 
            color: '#111827',
            margin: 0
          }}>
            Holdings
          </h2>
          <span style={{
            background: '#f1f5f9',
            color: '#0f172a',
            padding: '0.5rem 1rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: '700',
            border: '1px solid #e2e8f0'
          }}>
            {portfolio.holdings.length} Assets
          </span>
        </div>

        {portfolio.holdings.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ fontSize: '1.05rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>
              No holdings yet
            </p>
            <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              Start trading to build your portfolio
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {portfolio.holdings.map((holding) => (
              <div
                key={holding.symbol}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.35rem',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 18px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    background: '#f1f5f9',
                    color: '#0f172a',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '999px',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    border: '1px solid #e2e8f0'
                  }}>
                    {holding.symbol}
                  </div>
                  <div style={{
                    background: holding.pnl >= 0 ? '#ecfdf3' : '#fff1f2',
                    color: holding.pnl >= 0 ? '#166534' : '#b91c1c',
                    padding: '0.35rem 0.7rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    border: '1px solid #e5e7eb'
                  }}>
                    {formatPercent(holding.pnlPercent)}
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Quantity</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827' }}>
                      {holding.quantity.toFixed(8)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Avg Price</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827' }}>
                      {formatCurrency(holding.averagePrice)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Current</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#111827' }}>
                      {formatCurrency(holding.currentPrice)}
                    </span>
                  </div>
                </div>

                <div style={{
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '1rem',
                  marginTop: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#374151' }}>Total Value</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: '800', color: '#111827' }}>
                      {formatCurrency(holding.totalValue)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#374151' }}>P&L</span>
                    <span style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '800',
                      color: holding.pnl >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {holding.pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)}
                    </span>
                  </div>
                  <div style={{
                    marginTop: '0.75rem',
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    textAlign: 'center'
                  }}>
                    {formatPercent(holding.percentageOfPortfolio, 1)} of Portfolio
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#0f172a', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                    Asset
                  </th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '700' }}>
                    Quantity
                  </th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '700' }}>
                    Avg Price
                  </th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '700' }}>
                    Current
                  </th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '700' }}>
                    Value
                  </th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '700' }}>
                    P&L
                  </th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '700' }}>
                    %
                  </th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '700', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
                    Portfolio
                  </th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.map((holding, index) => (
                  <tr
                    key={holding.symbol}
                    style={{
                      background: index % 2 === 0 ? '#f9fafb' : 'white',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = index % 2 === 0 ? '#f9fafb' : 'white';
                    }}
                  >
                    <td style={{ padding: '1rem', fontWeight: '800', fontSize: '1rem', color: '#111827', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                      {holding.symbol}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#374151', fontWeight: '600' }}>
                      {holding.quantity.toFixed(8)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: '#111827' }}>
                      {formatCurrency(holding.averagePrice)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: '#111827' }}>
                      {formatCurrency(holding.currentPrice)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '800', fontSize: '1rem', color: '#111827' }}>
                      {formatCurrency(holding.totalValue)}
                    </td>
                    <td style={{ 
                      padding: '1rem', 
                      textAlign: 'right', 
                      fontWeight: '800',
                      color: holding.pnl >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {holding.pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)}
                    </td>
                    <td style={{ 
                      padding: '1rem', 
                      textAlign: 'right', 
                      fontWeight: '800',
                      color: holding.pnl >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {formatPercent(holding.pnlPercent)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#6b7280', fontWeight: '600', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
                      {formatPercent(holding.percentageOfPortfolio, 1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioView;
