# Crypto Trading Bot

A full-stack cryptocurrency trading platform with a React + TypeScript frontend and a Java Spring Boot backend. The app includes live market data, technical charts, trading controls, portfolio tracking, and automated strategy support.

## Highlights

- Live crypto prices and market snapshots
- Interactive charts with technical indicators
- Trading panel for buy and sell orders
- Portfolio view with holdings and performance
- Order book and trade history
- Strategy management for RSI, MACD, and moving average rules
- WebSocket support for real-time updates

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Java 17, Spring Boot, Spring Data JPA, Maven
- Data: REST APIs, WebSocket, H2 for local development

## Project Structure

- `frontend/` - React application
- `backend/` - Spring Boot API and trading logic
- `README.md` - Project overview and setup

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The frontend runs on `http://localhost:5173` and the backend runs on `http://localhost:8080`.

## Key API Areas

- Coins: market data and price endpoints
- Trading: orders, trades, and portfolio endpoints
- Bot: start, stop, status, and logs endpoints

## Notes

- The repository is set up as a monorepo with separate frontend and backend apps.
- Local build output and editor files are ignored through the root `.gitignore`.

## License

No license has been specified yet.
