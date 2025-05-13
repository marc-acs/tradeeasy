# TradeEasy Backend

Backend API for TradeEasy - a platform for international trade analytics and insights.

## Features

- RESTful API for HS code lookup, price data, tariff information, and risk analysis
- Integration with external data sources for real-time market data
- Forecasting capabilities for commodity price trends
- Authentication and user management
- Development mode with synthetic data fallbacks

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables (see `.env.example`)
4. Set up the PostgreSQL database:
   ```
   npm run db:migrate
   npm run db:seed
   ```
5. Start the development server:
   ```
   npm run dev
   ```

### Database Setup Options

- **PostgreSQL Mode** - Set `USE_MEMORY_DB=false` in `.env` to use a PostgreSQL database
- **In-Memory SQLite Mode** - Set `USE_MEMORY_DB=true` in `.env` to use an in-memory SQLite database for development and testing

## API Endpoints

- `/api/auth` - Authentication endpoints
- `/api/hscode` - HS code lookup and information
- `/api/price` - Price data for commodities
- `/api/tariff` - Tariff calculations
- `/api/risk` - Risk assessment
- `/api/forecast` - Price forecasting

## Data Sources

TradeEasy uses a hybrid data model with multiple tiers:

### Tier 1: External API Integration

TradeEasy attempts to connect to the following external APIs:

- **Quandl/Nasdaq Data API** - For commodity price data
- **OpenWeatherMap API** - For weather-related risk assessment 
- **USITC DataWeb API** - For tariff information
- **Google Cloud AI Platform** - For ML-based price forecasting

To use these APIs, you need to:
1. Register for API keys at their respective websites
2. Add the keys to your `.env` file
3. Restart the application

### Tier 2: Enhanced Fallback Mechanism

When external APIs are unavailable (due to rate limiting, network issues, or missing API keys), TradeEasy automatically falls back to its enhanced data generation system:

- **Commodity Price Data** - Realistic price patterns with appropriate seasonal variations, market volatility, and commodity-specific characteristics
- **Weather Risk Data** - Simulated weather patterns based on historical records
- **Tariff Information** - Representative tariff rates for different product categories
- **Forecast Data** - AI-simulated forecasting with realistic confidence intervals

This approach ensures:
- Reliable development and testing
- Graceful degradation when APIs aren't available
- Realistic data patterns for meaningful UI testing

## Testing

Run API connection tests:
```
npm run test-apis
```

Run PostgreSQL database test:
```
node test-postgres.js
```

Run enhanced price data tests:
```
node test-quandl.js
```

## Development

During development, you can use:

1. **Full API Mode** - Connect to all external APIs (requires API keys)
2. **Mixed Mode** - Connect to some APIs and use fallbacks for others
3. **Development Mode** - Use enhanced synthetic data for all features

Control this behavior by setting `NODE_ENV` in your `.env` file.

## Database Migration

This project has been migrated from MongoDB to PostgreSQL. The application now uses Sequelize ORM for database operations, supporting both PostgreSQL (production) and SQLite (in-memory for development). All models, controllers, and database operations have been updated to use Sequelize patterns.

## Documentation

Additional documentation:
- [API Integration Guide](./REAL_DATA_SETUP.md)
- [Quandl API Solution](./QUANDL_API_SOLUTION.md)