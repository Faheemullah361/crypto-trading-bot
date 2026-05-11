# 🚀 Crypto Trading Bot - Professional Trading Platform

A full-stack cryptocurrency trading application built with **React + TypeScript** frontend and **Java Spring Boot** backend. Features automated trading bots, real-time market data, technical analysis tools, and portfolio management.

## 🎯 Features

### Frontend (React + TypeScript + Tailwind CSS)
- **Live Market Data**: Real-time cryptocurrency prices for top 6 coins via CoinGecko API
- **Advanced Charts**: Interactive price charts with:
  - Moving Averages (20, 50, 200 day)
  - RSI (Relative Strength Index)
  - Bollinger Bands
  - Volume analysis
- **Trading Interface**: Buy/Sell orders with real-time price updates and quick buy percentages
- **Portfolio Management**: Real-time holdings, P&L calculation, portfolio distribution
- **Order Book**: Order management, trade history, order cancellation
- **Trading Strategies**: Create custom strategies (RSI, MACD, Moving Average) with performance tracking
- **WebSocket Support**: Real-time price updates and trade notifications

### Backend (Java Spring Boot)
- **RESTful APIs**: Complete trading APIs for orders, portfolio, strategies
- **Trading Bot Service**: Automated trading based on technical indicators (RSI, MACD, MA)
- **Technical Indicators**: RSI, MACD, Bollinger Bands, Moving Averages, ATR
- **WebSocket Support**: Real-time market data streaming
- **Database**: H2 in-memory database for development
- **Security**: CORS enabled, input validation

## 📁 Project Structure

```
crypto-trading-app/
├── frontend/
│   ├── src/
│   │   ├── components/    - React Components (CoinCard, LiveChart, TradingPanel, etc.)
│   │   ├── services/      - API & WebSocket Services
│   │   ├── types/         - TypeScript Interfaces
│   │   ├── utils/         - Helper Functions & Calculations
│   │   └── App.tsx        - Main App
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/main/java/com/cryptotrading/
│   │   ├── model/         - JPA Entities (Coin, Order, Trade, Strategy)
│   │   ├── repository/    - Data Access Layer
│   │   ├── service/       - Business Logic (CoinDataService, TradingBotService, etc.)
│   │   ├── controller/    - REST Controllers
│   │   ├── config/        - Configuration (WebSocket, CORS, RestTemplate)
│   │   └── CryptoTradingApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
└── README.md
```

## 🚀 Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev
# Access at http://localhost:5173
```

### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
# Runs on http://localhost:8080
```

## 📊 Key API Endpoints

**Coins**: GET /api/coins/top, GET /api/coins/{id}/price, GET /api/coins/{id}/chart

**Trading**: POST /api/trading/orders, GET /api/trading/orders, DELETE /api/trading/orders/{id}, GET /api/trading/trades, GET /api/trading/portfolio

**Bot**: POST /api/bot/start, POST /api/bot/stop, GET /api/bot/status, GET /api/bot/logs

## 🤖 Trading Strategies

- **RSI**: Buy (RSI < 30), Sell (RSI > 70)
- **MACD**: Buy (MACD crosses above signal), Sell (crosses below)
- **Moving Average**: Buy/Sell based on price crossing MA

## 💻 Tech Stack

**Frontend**: React 18, TypeScript, Tailwind CSS, Vite, WebSocket

**Backend**: Spring Boot 2.6+, Spring Data JPA, Java 17, H2 Database, Maven

## 📈 Statistics

- **Total Code**: 5000+ lines (Frontend + Backend combined)
- **Frontend Components**: 6+
- **REST Endpoints**: 10+
- **Technical Indicators**: 5+
- **Helper Functions**: 50+

## 🔐 Security

- CORS configuration
- Input validation
- Exception handling
- Type-safe TypeScript
- Secure WebSocket connections

---

**Built with ❤️ for crypto trading enthusiasts**

## Features
- Live data display for multiple cryptocurrencies
- Interactive charts for real-time price analysis
- Order book functionality to view buy and sell orders
- Trading interface for placing buy and sell orders
- Automated trading bot logic for executing trades based on specified strategies

## Project Structure
```
crypto-trading-app
├── frontend                # React frontend application
│   ├── public
│   │   └── index.html     # Main HTML file
│   ├── src
│   │   ├── App.tsx        # Root component
│   │   ├── index.tsx      # Entry point for React
│   │   ├── components      # React components
│   │   ├── services        # API and WebSocket services
│   │   ├── types           # TypeScript interfaces
│   │   └── utils           # Utility functions
│   ├── package.json        # NPM configuration
│   └── tsconfig.json       # TypeScript configuration
├── backend                 # Spring Boot backend application
│   ├── src
│   │   └── main
│   │       ├── java
│   │       │   └── com
│   │       │       └── cryptotrading
│   │       │           ├── CryptoTradingApplication.java
│   │       │           ├── config
│   │       │           ├── controller
│   │       │           ├── service
│   │       │           ├── model
│   │       │           └── repository
│   │       └── resources
│   │           ├── application.properties
│   │           └── application.yml
│   └── pom.xml            # Maven configuration
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites
- Node.js and npm for the frontend
- Java Development Kit (JDK) for the backend
- Maven for managing backend dependencies

### Installation

1. **Frontend**
   - Navigate to the `frontend` directory.
   - Run `npm install` to install the required dependencies.
   - Start the development server with `npm start`.

2. **Backend**
   - Navigate to the `backend` directory.
   - Run `mvn clean install` to build the project.
   - Start the Spring Boot application with `mvn spring-boot:run`.

### Usage
- Access the frontend application at `http://localhost:3000`.
- The backend API will be available at `http://localhost:8080`.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.