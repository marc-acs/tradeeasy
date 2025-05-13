# TradeEasy Analytics

TradeEasy Analytics is a Micro-SaaS platform designed to assist Argentine exporters and U.S. buyers in navigating global trade dynamics, particularly U.S. tariffs. The application provides commodity price tracking, U.S. tariff calculation, risk alerts, and AI-driven predictive price forecasting.

## Features

- **Commodity Price Tracker**: Monitor real-time and historical price trends for various commodities
- **U.S. Tariff Calculator**: Calculate import duties, fees, and total landed costs
- **Risk Alerts**: Stay informed about supply chain, weather, political, and regulatory risks
- **AI-driven Price Forecasting**: Get market price predictions with confidence intervals
- **Responsive Web Dashboard**: Access all features from any device

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL (formerly MongoDB)
- Sequelize ORM
- JWT Authentication
- RESTful API

### Frontend
- React
- Material UI
- Chart.js
- React Router
- Formik & Yup

### Data Sources
- Quandl API for commodity price data
- OpenWeatherMap for weather risk data
- U.S. International Trade Commission for tariff schedules
- Google Cloud AI Platform for forecasting

## Getting Started

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- API keys for external services (Quandl, OpenWeatherMap, etc.)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/tradeeasy-analytics.git
cd tradeeasy-analytics
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Create a `.env` file in the backend directory (use `.env.example` as a template)

4. Run migrations and seeders
```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

5. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server
```bash
cd frontend
npm start
```

3. Access the application at `http://localhost:3000`

## API Documentation

The API is organized around REST principles. All data is sent and received as JSON.

Base URL: `/api`

### Authentication Endpoints
- `POST /auth/signup`: Register a new user
- `POST /auth/login`: Authenticate user and get token
- `GET /auth/me`: Get current user profile
- `PATCH /auth/updateMe`: Update user profile

### HS Code Endpoints
- `GET /hscode`: Search HS codes
- `GET /hscode/:code`: Get specific HS code details
- `GET /hscode/saved/list`: Get user's saved HS codes
- `POST /hscode/:code/save`: Save an HS code
- `DELETE /hscode/:code/unsave`: Remove saved HS code

### Price Endpoints
- `GET /prices/:code/history`: Get price history for an HS code
- `GET /prices/:code/current`: Get current price for an HS code
- `POST /prices/compare`: Compare prices for multiple HS codes

### Tariff Endpoints
- `GET /tariffs/:code/current`: Get current tariff for an HS code
- `GET /tariffs/:code/history`: Get tariff history for an HS code
- `POST /tariffs/calculate`: Calculate duties and fees

### Risk Endpoints
- `GET /risks`: Get all risk alerts
- `GET /risks/hscode/:code`: Get risks for specific HS code
- `GET /risks/region/:region`: Get risks for specific region

### Forecast Endpoints
- `GET /forecasts/:code`: Get price forecast for an HS code
- `GET /forecasts/:code/multi-horizon`: Get forecasts for multiple time horizons
- `POST /forecasts/compare`: Compare forecasts for multiple HS codes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Quandl API](https://www.quandl.com/)
- [OpenWeatherMap API](https://openweathermap.org/)
- [U.S. International Trade Commission](https://www.usitc.gov/)
- [Google Cloud AI Platform](https://cloud.google.com/ai-platform)