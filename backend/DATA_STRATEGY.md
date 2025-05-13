# TradeEasy Data Strategy

## Overview

TradeEasy integrates with multiple external data sources while providing robust fallback mechanisms when external APIs are unavailable or return errors. This document explains our approach to data sourcing and integration.

## Data Sources

### Primary: External APIs

When available and functioning, TradeEasy attempts to use these external APIs:

1. **Quandl/Nasdaq Data API**
   - Price data for commodities
   - Historical price trends
   - Requires API key
   - Endpoint: `https://www.quandl.com/api/v3` or `https://data.nasdaq.com/api/v3`

2. **OpenWeatherMap API**
   - Weather data and forecasts
   - Weather-related risks for agricultural commodities
   - Requires API key 
   - Endpoint: `https://api.openweathermap.org/data/2.5`

3. **USITC DataWeb API**
   - Tariff rates and import regulations
   - Requires authentication token
   - Endpoint: `https://dataweb.usitc.gov/api/v1`

4. **Google Cloud AI Platform**
   - ML-based price forecasting
   - Requires API key
   - Endpoint: `https://us-central1-aiplatform.googleapis.com/v1/projects/tradeeasy-analytics/locations/us-central1/endpoints`

### Secondary: Enhanced Fallback System

When external APIs fail (due to rate limiting, network issues, or missing API keys), our enhanced fallback system automatically activates, providing:

1. **Advanced Price Simulation**
   - Commodity-specific price patterns
   - Seasonal variations
   - Realistic volatility
   - Market shock events
   - Appropriate units and currencies

2. **Simulated Risk Assessment**
   - Weather event patterns
   - Political and regulatory risks
   - Trade disruption events

3. **Representative Tariff Data**
   - Standard tariff rates by category
   - Country-specific variations

4. **Forecast Simulation**
   - Trend-based forecasts
   - Confidence intervals
   - Risk factor integration

## Implementation Details

### API Integration Layer

Each external API has a dedicated service class that handles:
- Authentication
- Multiple endpoint strategies
- Response parsing
- Error handling
- Automatic fallback to enhanced simulated data

### Enhanced Fallback System

Our fallback system is designed to:
1. Generate high-quality synthetic data
2. Maintain realistic patterns and relationships
3. Include appropriate volatility and seasonality
4. Signal to the frontend when using simulated data

### Data Quality Features

1. **Commodity-Specific Modeling**
   - Each commodity type has tailored price patterns
   - Seasonal effects vary by commodity
   - Appropriate price ranges and volatility

2. **Market Shock Simulation**
   - Random but realistic market disruptions
   - Appropriate recovery patterns

3. **Price-Volume Relationship**
   - Inverse elasticity (higher prices → lower volume) 
   - Seasonal volume patterns
   - Trading day effects

## Configuration

The `.env` file controls which data sources are active. With valid API keys, the system prioritizes real data; without them, it automatically uses the enhanced fallback system.

Example:
```
# To use real Quandl data (active)
QUANDL_API_KEY=real_key_here

# To use simulated price data (fallback)
QUANDL_API_KEY=
```

## Testing

The `test-apis.js` script tests all external API connections and verifies the fallback mechanisms. The `test-quandl.js` script specifically tests the enhanced price data generation.

## Data Exports

Generated price data can be exported to CSV format for analysis and visualization using the data export tools in the test scripts.

## Future Enhancements

- Implement data caching to reduce API calls
- Add more specialized commodity models
- Develop more sophisticated forecasting algorithms
- Integrate additional data sources for risk assessment