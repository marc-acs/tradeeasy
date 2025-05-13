# Setting Up TradeEasy With Real Data Sources

This guide explains how to configure TradeEasy to use real data sources instead of mock/synthetic data.

## Prerequisites

- Node.js and npm installed
- TradeEasy backend and frontend code
- API keys for external data providers

## Step 1: Obtain API Keys

### Quandl API (Price Data)
1. Create an account at https://www.quandl.com/
2. Navigate to your account page
3. Request or generate an API key
4. Free tier has limited requests per day

### OpenWeatherMap API (Weather Data)
1. Register at https://openweathermap.org/
2. Go to "My API Keys" section
3. Generate a new API key
4. Free tier has limits of 60 calls/minute and 1,000,000 calls/month

### USITC API (Tariff Data)
- The USITC API is publicly available but may require specific setup
- Check current documentation at https://hts.usitc.gov/

### Google Cloud AI Platform (ML-based Forecasting)
1. Create a Google Cloud Platform account
2. Set up a new project
3. Enable the AI Platform API
4. Create service account credentials
5. Download the API key

## Step 2: Configure Environment Variables

Create or update the `.env` file in the backend directory:

```
# Database Configuration
NODE_ENV=development
USE_MEMORY_DB=false
MONGODB_URI=mongodb://localhost:27017/tradeeasy

# JWT Configuration
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRES_IN=90d

# API Keys for Data Services
QUANDL_API_URL=https://www.quandl.com/api/v3
QUANDL_API_KEY=your-quandl-api-key

OPENWEATHERMAP_API_URL=https://api.openweathermap.org/data/2.5
OPENWEATHERMAP_API_KEY=your-openweathermap-api-key

USITC_API_URL=https://hts.usitc.gov/api

GOOGLE_CLOUD_AI_URL=https://us-central1-aiplatform.googleapis.com/v1/projects/your-project/locations/us-central1/endpoints
GOOGLE_CLOUD_AI_API_KEY=your-google-cloud-api-key
```

## Step 3: Start MongoDB (Required)

TradeEasy requires MongoDB for user data and caching external API results.

```bash
# Install MongoDB if not already installed
# On Ubuntu:
sudo apt-get install mongodb

# Start MongoDB service
sudo systemctl start mongodb

# Check status
sudo systemctl status mongodb
```

## Step 4: Configure Frontend

Update frontend configuration to use real data:

1. Open `/frontend/src/services/api.js`
2. Ensure `USE_MOCK_DATA` is set to `false`
3. Verify the API routes are correctly set to use the backend proxy

## Step 5: Start the Backend with Real Data

```bash
cd backend
npm install
USE_MEMORY_DB=false npm start
```

## Step 6: Start the Frontend

```bash
cd frontend
npm install
npm start
```

## Troubleshooting

### API Rate Limits
Most free tier API keys have request limitations. If you encounter 429 (Too Many Requests) errors:
- Implement caching on your end
- Reduce the frequency of requests
- Consider upgrading to paid plans

### MongoDB Connection Errors
If MongoDB fails to connect:
- Verify MongoDB is running: `sudo systemctl status mongodb`
- Check connection string in `.env` file
- Ensure MongoDB data directory exists and has correct permissions

### API Response Format Changes
If external APIs change their response format:
- Update the corresponding service files in `/backend/src/services/`
- Add appropriate error handling and data transformation

## Testing Direct API Access

Use the included `test-apis.js` script to verify direct API access without relying on MongoDB:

```bash
node test-apis.js
```

This script tests connections to all external data sources and reports results.