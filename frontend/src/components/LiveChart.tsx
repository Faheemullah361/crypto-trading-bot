import React, { useEffect, useState } from 'react';
import type { ChartData, Coin } from '../types';
import { CoinService } from '../services/api';
import { calculateBollingerBands, calculateMA } from '../utils/helpers';

type Timeframe = 'day' | 'week' | 'month' | 'year';

interface LiveChartProps {
  coin: Coin;
  timeframe?: Timeframe;
}

const timeframeToDays: Record<Timeframe, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
};

const LiveChart: React.FC<LiveChartProps> = ({ coin, timeframe = 'week' }) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [maData, setMaData] = useState<number[]>([]);
  const [bbData, setBbData] = useState<{ upper: number[]; middle: number[]; lower: number[] }>({ upper: [], middle: [], lower: [] });
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>(timeframe);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchChartData = async () => {
      setLoading(true);
      setError('');
      try {
        const days = timeframeToDays[activeTimeframe];
        const data = await CoinService.getCoinChartData(coin.id, days);
        if (!isMounted) return;
        setChartData(data);
        // Derive indicators only when data is available
        const ma = calculateMA(data, 20);
        const bb = calculateBollingerBands(data, 20, 2);
        setMaData(ma);
        setBbData(bb);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        if (isMounted) setError('Chart data not available right now.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchChartData();
    return () => {
      isMounted = false;
    };
  }, [coin.id, activeTimeframe]);

  const chartHeight = 300;

  // Calculate axis labels
  const getDateLabel = (index: number): string => {
    if (chartData.length === 0) return '';
    const dataPoint = chartData[index];
    const date = new Date(dataPoint.time);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const getPriceGridLabels = () => {
    const labels = [];
    for (let i = 0; i <= 5; i++) {
      const ratio = i / 5;
      const price = minPrice + (maxPrice - minPrice) * ratio;
      labels.push({ ratio, price });
    }
    return labels;
  };

  const axisTimePoints = [
    { index: 0, label: getDateLabel(0) },
    { index: Math.floor(chartData.length / 2), label: getDateLabel(Math.floor(chartData.length / 2)) },
    { index: chartData.length - 1, label: getDateLabel(chartData.length - 1) }
  ];

  if (loading) {
    return (
      <div style={{ width: '100%', height: '24rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: 8 }}>
        <div style={{ color: '#6b7280' }}>Loading chart data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: '100%', height: '24rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2', borderRadius: 8, color: '#991b1b', padding: '1rem' }}>
        {error}
      </div>
    );
  }

  if (chartData.length < 2) {
    return (
      <div style={{ width: '100%', height: '24rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: 8, color: '#6b7280' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Not enough data</p>
          <p style={{ fontSize: '0.875rem' }}>Try selecting a different timeframe (Week, Month, or Year)</p>
        </div>
      </div>
    );
  }

  const maxPrice = Math.max(...chartData.map((d) => d.price));
  const minPrice = Math.min(...chartData.map((d) => d.price));
  const priceRange = maxPrice - minPrice || 1; // avoid division by zero

  return (
    <div style={{ width: '100%', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '1.5rem', border: '1px solid #f0f1f3' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#000', margin: 0 }}>{coin.name} Price Chart</h3>
          <p style={{ fontSize: '0.8rem', color: '#7c8db5', margin: '0.25rem 0 0 0' }}>Live market data</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['day', 'week', 'month', 'year'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              style={{
                padding: '0.4rem 1rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: 6,
                border: activeTimeframe === tf ? '2px solid #2563eb' : '1px solid #e2e8f0',
                background: activeTimeframe === tf ? '#eff6ff' : '#f9fafb',
                color: activeTimeframe === tf ? '#2563eb' : '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          height: '380px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          display: 'flex'
        }}
      >
        {/* Left axis - Price labels */}
        <div style={{ width: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem 0.5rem', fontSize: '0.7rem', color: '#7c8db5', fontWeight: 500, background: '#f9fafb', borderRight: '1px solid #e2e8f0' }}>
          {getPriceGridLabels().map(({ ratio, price }) => (
            <div key={ratio} style={{ textAlign: 'right', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>$</div>
              <div>{price.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <div
              key={ratio}
              style={{
                position: 'absolute',
                top: `${ratio * 100}%`,
                left: 0,
                right: 0,
                borderTop: ratio === 0 || ratio === 1 ? '1px solid #cbd5e1' : '1px dotted #e2e8f0',
                zIndex: 0,
              }}
            />
          ))}

          {/* SVG chart with gradient and polylines */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1,
            }}
            viewBox={`0 0 ${chartData.length} ${chartHeight}`}
            preserveAspectRatio='none'
          >
            <defs>
              {/* Gradient for fill under price curve */}
              <linearGradient id='priceGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
                <stop offset='0%' stopColor='#3b82f6' stopOpacity='0.2' />
                <stop offset='100%' stopColor='#3b82f6' stopOpacity='0.01' />
              </linearGradient>
            </defs>

            {/* Fill area under price curve */}
            <polygon
              points={`0,${chartHeight} ${chartData
                .map((data, idx) => {
                  const x = idx;
                  const y = chartHeight - ((data.price - minPrice) / priceRange) * chartHeight;
                  return `${x},${y}`;
                })
                .join(' ')} ${chartData.length},${chartHeight}`}
              fill='url(#priceGradient)'
            />

            {/* Bollinger Bands Upper */}
            {bbData.upper.some((p) => !isNaN(p)) && (
              <polyline
                points={bbData.upper
                  .map((price, idx) => {
                    if (isNaN(price)) return null;
                    const x = idx;
                    const y = chartHeight - ((price - minPrice) / priceRange) * chartHeight;
                    return `${x},${y}`;
                  })
                  .filter((p) => p !== null)
                  .join(' ')}
                fill='none'
                stroke='#94a3b8'
                strokeWidth='0.8'
                strokeDasharray='2,2'
                strokeLinecap='round'
                opacity='0.4'
              />
            )}

            {/* Moving Average */}
            {maData.some((p) => !isNaN(p)) && (
              <polyline
                points={maData
                  .map((price, idx) => {
                    if (isNaN(price)) return null;
                    const x = idx;
                    const y = chartHeight - ((price - minPrice) / priceRange) * chartHeight;
                    return `${x},${y}`;
                  })
                  .filter((p) => p !== null)
                  .join(' ')}
                fill='none'
                stroke='#f59e0b'
                strokeWidth='1.2'
                strokeLinecap='round'
                strokeLinejoin='round'
                opacity='0.9'
              />
            )}

            {/* Price Line - Main with enhanced rendering */}
            <polyline
              points={chartData
                .map((data, idx) => {
                  const x = idx;
                  const y = chartHeight - ((data.price - minPrice) / priceRange) * chartHeight;
                  return `${x},${y}`;
                })
                .join(' ')}
              fill='none'
              stroke='#2563eb'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
              vectorEffect='non-scaling-stroke'
            />

            {/* Bollinger Bands Lower */}
            {bbData.lower.some((p) => !isNaN(p)) && (
              <polyline
                points={bbData.lower
                  .map((price, idx) => {
                    if (isNaN(price)) return null;
                    const x = idx;
                    const y = chartHeight - ((price - minPrice) / priceRange) * chartHeight;
                    return `${x},${y}`;
                  })
                  .filter((p) => p !== null)
                  .join(' ')}
                fill='none'
                stroke='#94a3b8'
                strokeWidth='0.8'
                strokeDasharray='2,2'
                strokeLinecap='round'
                opacity='0.4'
              />
            )}
          </svg>
        </div>
      </div>

      {/* Bottom axis - Time labels with data */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0.5rem 0 60px', fontSize: '0.7rem', color: '#7c8db5', fontWeight: 500 }}>
        {axisTimePoints.map(({ index, label }) => (
          <div key={index} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
              {chartData[index] && `$${chartData[index].price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            </div>
            <div>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price Range</p>
          <p style={{ fontWeight: 700, color: '#000', margin: '0.5rem 0 0 0', fontSize: '1.125rem' }}>
            ${minPrice.toFixed(2)} – ${maxPrice.toFixed(2)}
          </p>
        </div>
        <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Price</p>
          <p style={{ fontWeight: 700, color: '#2563eb', margin: '0.5rem 0 0 0', fontSize: '1.125rem' }}>
            ${chartData[chartData.length - 1].price.toFixed(2)}
          </p>
        </div>
        <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>24h Volume</p>
          <p style={{ fontWeight: 700, color: '#f59e0b', margin: '0.5rem 0 0 0', fontSize: '1.125rem' }}>
            ${(chartData.reduce((sum, d) => sum + d.volume, 0) / 1e9).toFixed(2)}B
          </p>
        </div>
      </div>

      <div style={{ marginTop: '1rem', padding: '0.875rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: '#6b7280', fontWeight: 500, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#2563eb', borderRadius: '2px' }} />
            <span>Price</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '12px', height: '2px', background: '#f59e0b' }} />
            <span>MA (20)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '12px', height: '2px', background: '#cbd5e1', backgroundImage: 'repeating-linear-gradient(90deg, #cbd5e1 0, #cbd5e1 2px, transparent 2px, transparent 4px)' }} />
            <span>Bollinger Bands</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChart;
