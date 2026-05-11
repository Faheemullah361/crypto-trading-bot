import React, { useState, useEffect } from 'react';
import type { Coin } from '../types';
import { CoinService } from '../services/api';
import { formatCurrency, formatPercent, getPriceChangeColor } from '../utils/helpers';

interface CoinCardProps {
  coin: Coin;
  onClick?: () => void;
}

const CoinCard: React.FC<CoinCardProps> = ({ coin, onClick }) => {
  const [priceHistory, setPriceHistory] = useState<number[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await CoinService.getCoinChartData(coin.id, 7);
        setPriceHistory(history.map((d) => d.price));
      } catch (error) {
        console.error('Error fetching price history:', error);
      }
    };
    fetchHistory();
  }, [coin.id]);

  const minPrice = Math.min(...priceHistory);
  const maxPrice = Math.max(...priceHistory);
  const trend =
    priceHistory.length > 0 &&
    priceHistory[priceHistory.length - 1] > priceHistory[0]
      ? 'up'
      : 'down';

  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(60,74,100,0.62)',
        borderRadius: '16px',
        border: '2px solid rgba(184,198,220,0.38)',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 14px 28px rgba(0,0,0,0.24)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#a8d4ff';
        e.currentTarget.style.boxShadow = '0 18px 32px rgba(124,181,255,0.26)';
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(184,198,220,0.38)';
        e.currentTarget.style.boxShadow = '0 14px 28px rgba(0,0,0,0.24)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img
            src={coin.imageUrl}
            alt={coin.name}
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          />
          <div>
            <h3 style={{ fontWeight: '600', color: '#e8edf5', margin: 0 }}>{coin.symbol}</h3>
            <p style={{ fontSize: '0.875rem', color: '#b8c7da', margin: 0 }}>{coin.name}</p>
          </div>
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            padding: '0.25rem 0.5rem',
            borderRadius: '6px',
            background: trend === 'up' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            color: trend === 'up' ? '#10b981' : '#ef4444'
          }}
        >
          {trend === 'up' ? '📈' : '📉'}
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f6f8fc', margin: 0 }}>
          {formatCurrency(coin.currentPrice)}
        </p>
        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: coin.priceChangePercent24h >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>
          {formatPercent(coin.priceChangePercent24h)}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', color: '#b8c7da', marginBottom: '1rem' }}>
        <div>
          <p style={{ fontWeight: '600', margin: 0 }}>24h High</p>
          <p style={{ color: '#e2e8f0', margin: 0 }}>{formatCurrency(coin.ath)}</p>
        </div>
        <div>
          <p style={{ fontWeight: '600', margin: 0 }}>24h Low</p>
          <p style={{ color: '#e2e8f0', margin: 0 }}>{formatCurrency(coin.atl)}</p>
        </div>
      </div>

      <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(148,163,184,0.35)' }}>
        <p style={{ fontSize: '0.75rem', color: '#b8c7da', marginBottom: '0.5rem' }}>Market Cap</p>
        <p style={{ fontWeight: '600', color: '#e2e8f0', margin: 0 }}>
          {coin.marketCap > 0 ? formatCurrency(coin.marketCap) : 'N/A'}
        </p>
      </div>

      <div style={{ marginTop: '1rem', height: '3rem', background: 'rgba(15,23,42,0.32)', borderRadius: '8px', display: 'flex', alignItems: 'flex-end', gap: '2px', padding: '0.5rem' }}>
        {priceHistory.length > 0 &&
          priceHistory.map((price, idx) => (
            <div
              key={idx}
              style={{
                height: `${((price - minPrice) / (maxPrice - minPrice)) * 100}%`,
                backgroundColor: trend === 'up' ? '#10b981' : '#ef4444',
                flex: 1,
                borderRadius: '2px',
              }}
            />
          ))}
      </div>
    </div>
  );
};

export default CoinCard;
