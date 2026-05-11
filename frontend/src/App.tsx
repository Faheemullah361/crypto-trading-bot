import { useState, useEffect } from 'react';
import type { Coin } from './types/index';
import { CoinService } from './services/api';
import LiveChart from './components/LiveChart';
import TradingPanel from './components/TradingPanel';
import OrderBook from './components/OrderBook';
import PortfolioView from './components/PortfolioView';
import StrategyManager from './components/StrategyManager';
import './App.css';

type View = 'coins' | 'trading' | 'portfolio' | 'strategies' | 'orders';

function App() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState<View>('coins');
  const [balance] = useState(10000);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchCoins();
    const interval = setInterval(fetchCoins, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCoins = async (isRetry = false) => {
    try {
      // Keep prior data visible; only treat the very first fetch as loading
      setError('');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const data = await CoinService.getTopCoins(6);
      clearTimeout(timeoutId);
      
      setCoins(data);
      if (!selectedCoin && data.length > 0) setSelectedCoin(data[0]);
      setInitialLoad(false);
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching coins:', err);
      
      // Retry logic
      if (isRetry && retryCount < 2) {
        setRetryCount(retryCount + 1);
        setTimeout(() => fetchCoins(true), 2000);
        return;
      }
      
      // Only show error message once, don't keep refreshing
      if (initialLoad) {
        setError('Failed to load market data. Using demo data.');
        // Demo data for testing
        const demoCoins: Coin[] = [
          {
            id: 'bitcoin',
            symbol: 'BTC',
            name: 'Bitcoin',
            currentPrice: 45000,
            priceChange24h: 1250,
            priceChangePercent24h: 2.85,
            marketCap: 850000000000,
            volume24h: 35000000000,
            circulatingSupply: 19000000,
            imageUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
            ath: 69000,
            atl: 67.81,
            lastUpdated: new Date().toISOString(),
          }
        ];
        setCoins(demoCoins);
        setInitialLoad(false);
      }
    }
  };

  const navLinks: { id: View; label: string }[] = [
    { id: 'coins', label: 'Markets' },
    { id: 'trading', label: 'Trading' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'strategies', label: 'Strategies' },
    { id: 'orders', label: 'Orders' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#142a44',
      color: '#f1f5f9'
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 60,
        background: '#12314f',
        boxShadow: '0 4px 14px rgba(0,0,0,0.28)',
        borderBottom: '1px solid rgba(148,163,184,0.45)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'linear-gradient(145deg, #3b82f6, #2563eb)',
                  boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }} />
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.01em', color: '#f8fbff' }}>
                    Crypto Trading Bot
                  </h1>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#c5d7ef', fontWeight: 500 }}>
                    Real-time execution • Institutional-grade UI
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 }}>
              <nav style={{ display: 'flex', gap: '0.25rem', padding: '0.375rem', background: 'rgba(26,42,68,0.6)', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.45)', overflowX: 'auto' }}>
                {navLinks.map((nav) => {
                  const active = currentView === nav.id;
                  return (
                    <button
                      key={nav.id}
                      onClick={() => setCurrentView(nav.id)}
                      style={{
                        padding: '0.65rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: active ? 'rgba(124,181,255,0.22)' : 'transparent',
                        color: active ? '#b5d9ff' : '#d8e2f0',
                        fontWeight: active ? '700' : '600',
                        fontSize: '0.9rem',
                        letterSpacing: '0.01em',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: active ? '0 0 14px rgba(124,181,255,0.25)' : 'none'
                      }}
                    >
                      {nav.label}
                    </button>
                  );
                })}
              </nav>

              <div style={{
                minWidth: '220px',
                background: 'rgba(46,58,82,0.6)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                border: '1px solid rgba(148,163,184,0.45)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.24)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#f6f8fc', fontWeight: 600 }}>Wallet Balance</span>
                  <span style={{ fontSize: '0.75rem', color: '#e5edfb', padding: '0.25rem 0.5rem', borderRadius: '6px', background: 'rgba(184,198,220,0.25)', border: '1px solid rgba(184,198,220,0.45)' }}>
                    USD
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.01em' }}>${balance.toFixed(2)}</span>
                  <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        {currentView === 'coins' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc', marginBottom: '1.5rem' }}>
              Top Cryptocurrencies
            </h2>
            
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ color: '#991b1b', fontSize: '0.875rem' }}>{error}</p>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {coins.map((coin) => (
                <div
                  key={coin.id}
                  style={{
                    background: 'linear-gradient(180deg, #f8fafc 0%, #f3f6fb 100%)',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setSelectedCoin(coin)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {coin.imageUrl && (
                        <img
                          src={coin.imageUrl}
                          alt={coin.name}
                          style={{ width: '2rem', height: '2rem', borderRadius: '50%' }}
                        />
                      )}
                      <div>
                        <h3 style={{ fontWeight: '600', color: '#111827', margin: 0 }}>{coin.symbol}</h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{coin.name}</p>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      background: coin.priceChangePercent24h > 0 ? '#d1fae5' : '#fee2e2',
                      color: coin.priceChangePercent24h > 0 ? '#065f46' : '#991b1b'
                    }}>
                      {coin.priceChangePercent24h > 0 ? '📈' : '📉'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                      ${coin.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: coin.priceChangePercent24h > 0 ? '#10b981' : '#ef4444',
                      margin: '0.25rem 0 0 0'
                    }}>
                      {coin.priceChangePercent24h > 0 ? '+' : ''}{coin.priceChangePercent24h.toFixed(2)}%
                    </p>
                  </div>

                  <div style={{ paddingTop: '1rem', borderTop: '1px solid #e6ebf3' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>Market Cap</p>
                    <p style={{ fontWeight: '600', color: '#111827', margin: 0 }}>
                      ${(coin.marketCap / 1e9).toFixed(2)}B
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {selectedCoin && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '1rem' }}>
                  {selectedCoin.name} price chart
                </h3>
                <LiveChart key={selectedCoin.id} coin={selectedCoin} timeframe='week' />
              </div>
            )}
          </div>
        )}

        {currentView === 'trading' && selectedCoin && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '1.5rem' }}>
                Trading - {selectedCoin.symbol}
            </h2>
            <TradingPanel 
              symbol={selectedCoin.symbol}
              currentPrice={selectedCoin.currentPrice}
              balance={balance}
              coins={coins}
              onCoinChange={(coin) => setSelectedCoin(coin)}
            />
          </div>
        )}

        {currentView === 'trading' && !selectedCoin && (
          <div style={{
            background: 'linear-gradient(180deg, #f8fafc 0%, #f3f6fb 100%)',
            borderRadius: '0.75rem',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
          }}>
            <p style={{ color: '#6b7280' }}>Please select a coin from Markets tab to start trading</p>
          </div>
        )}

        {currentView !== 'coins' && currentView !== 'trading' && currentView !== 'portfolio' && currentView !== 'strategies' && currentView !== 'orders' && (
          <div style={{
            background: 'linear-gradient(180deg, #f8fafc 0%, #f3f6fb 100%)',
            borderRadius: '0.75rem',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
              {String(currentView).charAt(0).toUpperCase() + String(currentView).slice(1)} View
            </h2>
            <p style={{ color: '#6b7280' }}>This section is under development</p>
          </div>
        )}

        {currentView === 'strategies' && (
          <StrategyManager />
        )}

        {currentView === 'orders' && (
          <OrderBook />
        )}

        {currentView === 'portfolio' && (
          <PortfolioView />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: '#111827',
        color: '#9ca3af',
        marginTop: '3rem',
        padding: '2rem 1rem',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0 }}>&copy; 2025 Crypto Trading Bot. All rights reserved.</p>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>Built with React + Spring Boot</p>
      </footer>
    </div>
  );
}

export default App;
