# REFERENCES

Complete documentation and links for all technologies and libraries used in the Crypto Trading Application.

---

## 🔧 Backend (Java/Spring Boot 2.6.6)

### Core Framework & Libraries

| Technology | Purpose | Link |
|-----------|---------|------|
| **Spring Boot 2.6.6** | Enterprise Java framework for building scalable applications | https://spring.io/projects/spring-boot |
| **Spring Web** | REST API development, HTTP request/response handling, MVC pattern | https://spring.io/projects/spring-framework |
| **Spring WebSocket** | Real-time bidirectional communication for live market data and order updates | https://spring.io/guides/gs/messaging-stomp-websocket/ |
| **Spring Data JPA** | Object-relational mapping (ORM), database query operations, entity management | https://spring.io/projects/spring-data-jpa |
| **Spring Security** | Authentication (login/register), authorization, token management, password encryption | https://spring.io/projects/spring-security |
| **Spring Validation** | Input validation using annotations (@NotNull, @Size, @Email), constraint validation | https://docs.spring.io/spring-framework/reference/core/validation.html |

### Database

| Technology | Purpose | Link |
|-----------|---------|------|
| **H2 Database 2.2.224** | In-memory SQL database for development, testing, and prototyping | https://www.h2database.com/html/main.html |

### Build & Dependency Management

| Technology | Purpose | Link |
|-----------|---------|------|
| **Maven** | Build automation, dependency resolution, project lifecycle management | https://maven.apache.org/ |
| **Java 17 (JDK)** | Programming language, latest LTS version with modern features | https://openjdk.java.net/projects/jdk/17/ |

---

## 🎨 Frontend (React + TypeScript)

### Core Framework & Runtime

| Technology | Purpose | Link |
|-----------|---------|------|
| **React 19.2.0** | JavaScript library for building interactive user interfaces with component-based architecture | https://react.dev/ |
| **React DOM 19.2.0** | React package for rendering components to the DOM, browser manipulation | https://react.dev/reference/react-dom |
| **TypeScript 5.9.3** | JavaScript superset with static typing, type checking, and enhanced IDE support | https://www.typescriptlang.org/ |
| **Node.js** | JavaScript runtime environment for development and running build tools | https://nodejs.org/ |

### Build Tools & Development Server

| Technology | Purpose | Link |
|-----------|---------|------|
| **Vite 7.2.4** | Fast build tool, development server, hot module replacement (HMR) | https://vitejs.dev/ |
| **npm** | Node Package Manager for installing and managing JavaScript dependencies | https://www.npmjs.com/ |

### Styling & CSS

| Technology | Purpose | Link |
|-----------|---------|------|
| **Tailwind CSS 4.1.18** | Utility-first CSS framework for rapid UI development | https://tailwindcss.com/ |
| **PostCSS 8.5.6** | CSS transformation tool, plugin ecosystem for processing stylesheets | https://postcss.org/ |
| **Autoprefixer** | PostCSS plugin to add vendor-specific CSS prefixes for browser compatibility | https://github.com/postcss/autoprefixer |

### Data Visualization & Charting

| Technology | Purpose | Link |
|-----------|---------|------|
| **Recharts 3.6.0** | React-based charting library for interactive market charts, price graphs, analytics | https://recharts.org/ |

### HTTP Communication

| Technology | Purpose | Link |
|-----------|---------|------|
| **Axios 1.13.2** | Promise-based HTTP client for making REST API requests, error handling | https://axios-http.com/ |

### Code Quality & Linting

| Technology | Purpose | Link |
|-----------|---------|------|
| **ESLint 9.39.1** | JavaScript linter for code quality, style consistency, error detection | https://eslint.org/ |
| **TypeScript ESLint 8.46.4** | ESLint parser and plugins for TypeScript code analysis | https://typescript-eslint.io/ |
| **ESLint Plugin React Hooks 7.0.1** | ESLint rules for React Hooks best practices and common mistakes | https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks |
| **ESLint Plugin React Refresh 0.4.24** | ESLint support for Fast Refresh to prevent issues with hot reloading | https://github.com/ArnaudBarre/eslint-plugin-react-refresh |

---

## 🔌 Communication Protocols & Standards

| Protocol | Purpose | Documentation |
|----------|---------|---------------|
| **WebSocket (RFC 6455)** | Real-time bidirectional communication for live order updates and market data | https://tools.ietf.org/html/rfc6455 |
| **CORS (Cross-Origin Resource Sharing)** | Secure cross-domain requests between frontend and backend | https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS |
| **REST API** | Representational State Transfer architecture for HTTP API design | https://restfulapi.net/ |
| **JSON** | Data format for API requests/responses and data serialization | https://www.json.org/ |

---

## 📚 Project Architecture & Features

### Trading System
- **Order Types**: 
  - Market Orders (instant execution at current price)
  - Limit Orders (execute at specified price)
  - Stop-Loss Orders (protective orders to prevent losses)
- **Order Management**: Full CRUD operations (Create, Read, Update, Delete)
- **Order Statistics**: Real-time metrics, performance analytics, P&L calculations
- **Real-time Updates**: WebSocket push notifications for order status changes

### Market Data & Visualization
- **Live Coin Data**: Real-time cryptocurrency prices and market information
- **Market Charts**: Historical price visualization with Recharts library
- **Order Book**: Order matching engine and depth analysis
- **Price Updates**: WebSocket connections for streaming price data

### Security & Authentication
- **User Authentication**: Registration and login with Spring Security
- **Authorization**: Role-based access control (RBAC) for different user levels
- **Input Validation**: Server-side request validation and sanitization
- **CORS Security**: Protection against cross-origin attacks
- **Password Encryption**: Secure password hashing and storage

### Deployment Architecture
- **Multi-threaded Backend**: Concurrent order processing using thread pools
- **Asynchronous Operations**: Non-blocking I/O for better performance
- **Responsive Frontend**: Mobile-friendly UI with Tailwind CSS
- **Scalable Architecture**: Spring Boot ready for microservices deployment
- **WebSocket Support**: Real-time push notifications without polling

---

## 🌐 External Integrations (Ready for Implementation)

| Service | Purpose | Use Case |
|---------|---------|----------|
| **CoinGecko API** | Free cryptocurrency market data | Real-time price feeds, historical data |
| **Binance API** | Exchange API for trading and market data | Order execution, market depth |
| **Other Crypto APIs** | Various market data providers | Fallback data sources, analytics |

---

## 📋 Development Workflow

### Local Development
```bash
Backend:  mvnw.cmd spring-boot:run (Java 17 + Maven)
Frontend: npm run dev (Node.js + Vite)
```

### Build & Production
```bash
Backend:  mvnw.cmd clean package
Frontend: npm run build
```

### Testing & Quality
```bash
Backend:  mvnw.cmd test
Frontend: npm run lint
```

---

## 📖 Documentation References

- **Spring Boot Guide**: https://spring.io/guides
- **React Documentation**: https://react.dev/learn
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Vite Configuration**: https://vitejs.dev/config/
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Maven Documentation**: https://maven.apache.org/guides/

---

**Project Name**: Crypto Trading Application  
**Current Version**: 1.0-SNAPSHOT  
**Java Version**: 17 (LTS)  
**Spring Boot Version**: 2.6.6  
**Node Version**: Required for frontend development  
**Last Updated**: January 2026
