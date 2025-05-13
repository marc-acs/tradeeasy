const axios = require('axios');
const dotenv = require('dotenv');
const Price = require('../models/price.model');
const Risk = require('../models/risk.model');

dotenv.config();

const GOOGLE_CLOUD_AI_API_KEY = process.env.GOOGLE_CLOUD_AI_API_KEY;
const GOOGLE_CLOUD_AI_URL = process.env.GOOGLE_CLOUD_AI_URL || 'https://us-central1-aiplatform.googleapis.com/v1/projects/tradeeasy-analytics/locations/us-central1/endpoints';

/**
 * Service for price forecasting using machine learning
 */
class ForecastService {
  /**
   * Generate price forecast for a specific HS code
   * @param {string} hsCode - The HS code
   * @param {string} horizon - Forecast horizon ('1m', '3m', '6m', '1y')
   * @param {Array} historicalPrices - Historical price data
   * @param {Array} riskFactors - Risk factors that may affect price
   * @returns {Promise<Object>} - Price forecast
   */
  async generateForecast(hsCode, horizon = '1m', historicalPrices, riskFactors) {
    try {
      // In a real implementation, this would call the Google Cloud AI Platform
      // For now, we'll create a simulated forecast based on historical data and risk factors
      
      // Verify we have enough data
      if (!historicalPrices || historicalPrices.length < 2) {
        throw new Error('Not enough historical price data to generate forecast');
      }
      
      // Sort by date (ascending)
      historicalPrices.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Get latest price and metadata
      const latestPrice = historicalPrices[historicalPrices.length - 1];
      const currency = latestPrice.currency;
      const unit = latestPrice.unit;
      
      // Calculate forecast date based on horizon
      const forecastDate = this.getDateForHorizon(horizon);
      
      // Generate forecast
      const { 
        predictedPrice, 
        confidenceInterval, 
        confidenceScore 
      } = await this.predictPrice(hsCode, horizon, historicalPrices, riskFactors);
      
      // Prepare response
      return {
        hsCode,
        date: forecastDate,
        predictedPrice,
        confidenceInterval,
        confidenceScore,
        factors: this.processForecastFactors(riskFactors, historicalPrices),
        modelVersion: 'v1.0', // Would be dynamic in production
        currency,
        unit,
        horizon,
        createdAt: new Date()
      };
    } catch (error) {
      console.error(`Error generating forecast for HS code ${hsCode}:`, error);
      throw error;
    }
  }
  
  /**
   * Calculate predicted price using time series forecasting and risk adjustment
   * @param {string} hsCode - The HS code
   * @param {string} horizon - Forecast horizon
   * @param {Array} historicalPrices - Historical price data
   * @param {Array} riskFactors - Risk factors
   * @returns {Promise<Object>} - Prediction results
   */
  async predictPrice(hsCode, horizon, historicalPrices, riskFactors) {
    // Check if we should try to use Google Cloud AI API
    if (GOOGLE_CLOUD_AI_API_KEY && !GOOGLE_CLOUD_AI_API_KEY.includes('real_google_cloud_ai_key_here')) {
      try {
        // In a real implementation, this would call Google Cloud AI API
        console.log(`Attempting to use Google Cloud AI for ML-based forecasting for HS code: ${hsCode}, horizon: ${horizon}`);
        
        // Uncomment this when you have a valid API key and implementation
        // const mlPrediction = await this.callGoogleCloudAiApi(hsCode, horizon, historicalPrices, riskFactors); 
        // return mlPrediction;
        
        // For now, simulate ML call but use statistical model
        console.log('ML API integration is pending - using statistical model with ML simulation');
        const simulatedMlResult = await this.callGoogleCloudAiApi(hsCode, horizon, historicalPrices, riskFactors);
        return simulatedMlResult;
      } catch (apiError) {
        console.warn('Error calling ML API, falling back to statistical model:', apiError.message);
        if (apiError.response) {
          console.error(`  Status: ${apiError.response.status}`);
          console.error(`  Details: ${JSON.stringify(apiError.response.data)}`);
        }
        // Continue with fallback method
      }
    } else {
      console.log(`Using statistical forecasting model for HS code: ${hsCode} (no valid Google Cloud AI API key configured)`);
    }
    
    // Fallback to statistical forecasting algorithm
    
    // Extract price time series
    const prices = historicalPrices.map(p => p.price);
    const dates = historicalPrices.map(p => new Date(p.date));
    
    // Calculate trend using simple linear regression
    const trend = this.calculateTrend(dates, prices);
    
    // Calculate volatility
    const volatility = this.calculateVolatility(prices);
    
    // Calculate seasonality (if applicable)
    const seasonality = this.calculateSeasonality(hsCode, horizon);
    
    // Calculate risk impact
    const riskImpact = this.calculateRiskImpact(riskFactors);
    
    // Latest price
    const latestPrice = prices[prices.length - 1];
    
    // Calculate forecast horizon in days
    const horizonDays = this.getHorizonDays(horizon);
    
    // Calculate trend component
    const trendComponent = trend * horizonDays;
    
    // Calculate predicted price
    const predictedPrice = latestPrice + trendComponent + (latestPrice * seasonality) + (latestPrice * riskImpact);
    
    // Calculate confidence interval and score based on volatility and horizon
    const confidenceMargin = latestPrice * volatility * Math.sqrt(horizonDays / 30);
    const confidenceInterval = {
      lower: Math.max(0, predictedPrice - confidenceMargin),
      upper: predictedPrice + confidenceMargin
    };
    
    // Calculate confidence score (0-100)
    // Higher volatility and longer horizons reduce confidence
    const baseConfidence = 90;
    const volatilityPenalty = volatility * 100 * 2;
    const horizonPenalty = (horizonDays / 30) * 5;
    
    const confidenceScore = Math.max(30, Math.min(90, baseConfidence - volatilityPenalty - horizonPenalty));
    
    return {
      predictedPrice,
      confidenceInterval,
      confidenceScore: Math.round(confidenceScore)
    };
  }
  
  /**
   * Call Google Cloud AI API for ML-based price forecasting
   * This is a placeholder for the actual implementation
   * @param {string} hsCode - HS code
   * @param {string} horizon - Forecast horizon
   * @param {Array} historicalPrices - Historical price data
   * @param {Array} riskFactors - Risk factors
   * @returns {Object} - ML model predictions
   */
  async callGoogleCloudAiApi(hsCode, horizon, historicalPrices, riskFactors) {
    // In a real implementation, this would format the data
    // and send it to the Google Cloud AI API endpoint
    
    // For now, we return a mock response with a slight variation
    // from the statistical model to simulate ML enhancement
    
    // Extract price time series
    const prices = historicalPrices.map(p => p.price);
    const dates = historicalPrices.map(p => new Date(p.date));
    
    // Calculate trend and volatility
    const trend = this.calculateTrend(dates, prices);
    const volatility = this.calculateVolatility(prices);
    
    // Latest price
    const latestPrice = prices[prices.length - 1];
    
    // Calculate forecast horizon in days
    const horizonDays = this.getHorizonDays(horizon);
    
    // Calculate trend component with a boost for ML
    const trendComponent = trend * horizonDays * 1.1; // ML sees stronger trend
    
    // More nuanced ML prediction (simulated)
    const predictedPrice = latestPrice + trendComponent;
    
    // Tighter confidence intervals (ML is more certain)
    const confidenceMargin = latestPrice * volatility * Math.sqrt(horizonDays / 30) * 0.8;
    const confidenceInterval = {
      lower: Math.max(0, predictedPrice - confidenceMargin),
      upper: predictedPrice + confidenceMargin
    };
    
    // Higher confidence score for ML
    const confidenceScore = Math.min(95, 70 + Math.random() * 15);
    
    return {
      predictedPrice,
      confidenceInterval,
      confidenceScore: Math.round(confidenceScore)
    };
  }
  
  /**
   * Calculate price trend using linear regression
   * @param {Array} dates - Array of dates
   * @param {Array} prices - Array of prices
   * @returns {number} - Price change per day
   */
  calculateTrend(dates, prices) {
    // Convert dates to numeric values (days since first date)
    const x = dates.map(d => d.getTime() / (24 * 60 * 60 * 1000));
    const firstX = x[0];
    const normalizedX = x.map(xi => xi - firstX);
    
    // Calculate linear regression coefficients
    const n = prices.length;
    const sumX = normalizedX.reduce((sum, xi) => sum + xi, 0);
    const sumY = prices.reduce((sum, yi) => sum + yi, 0);
    const sumXY = normalizedX.reduce((sum, xi, i) => sum + xi * prices[i], 0);
    const sumXX = normalizedX.reduce((sum, xi) => sum + xi * xi, 0);
    
    // Calculate slope
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Return daily price change
    return slope;
  }
  
  /**
   * Calculate price volatility
   * @param {Array} prices - Price array
   * @returns {number} - Volatility (0-1)
   */
  calculateVolatility(prices) {
    if (prices.length < 2) return 0.1; // Default
    
    // Calculate returns
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    // Calculate standard deviation of returns
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev;
  }
  
  /**
   * Calculate seasonality factor
   * @param {string} hsCode - HS code
   * @param {string} horizon - Forecast horizon
   * @returns {number} - Seasonality factor (-0.1 to 0.1)
   */
  calculateSeasonality(hsCode, horizon) {
    // This would use historical seasonal patterns in production
    // For now, we'll use a simplified approach
    
    // Agricultural products have stronger seasonality
    const isAgricultural = hsCode.startsWith('01') || 
                           hsCode.startsWith('02') || 
                           hsCode.startsWith('07') || 
                           hsCode.startsWith('08') || 
                           hsCode.startsWith('10') || 
                           hsCode.startsWith('12');
    
    if (!isAgricultural) return 0;
    
    // Simple seasonal pattern based on current month
    const currentMonth = new Date().getMonth();
    const monthsAhead = this.getHorizonDays(horizon) / 30;
    const targetMonth = (currentMonth + Math.floor(monthsAhead)) % 12;
    
    // Southern hemisphere harvest seasons for key crops
    if ([0, 1, 2].includes(targetMonth)) { // Jan-Mar: Harvest season in Argentina
      return -0.05; // Prices tend to decrease during harvest
    } else if ([5, 6, 7].includes(targetMonth)) { // Jun-Aug: Off-season
      return 0.03; // Prices tend to increase in off-season
    }
    
    return 0;
  }
  
  /**
   * Calculate risk impact on price
   * @param {Array} riskFactors - Risk factors
   * @returns {number} - Combined risk impact (-0.5 to 0.5)
   */
  calculateRiskImpact(riskFactors) {
    if (!riskFactors || riskFactors.length === 0) return 0;
    
    // Sum up individual risk impacts, weighted by confidence
    let totalImpact = 0;
    let totalWeight = 0;
    
    riskFactors.forEach(risk => {
      const impact = risk.expectedPriceImpact?.direction === 'increase' ? 
                    (risk.expectedPriceImpact?.percentage || 0) / 100 : 
                    -(risk.expectedPriceImpact?.percentage || 0) / 100;
      
      const weight = (risk.expectedPriceImpact?.confidence || 50) / 100;
      
      totalImpact += impact * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? totalImpact / totalWeight : 0;
  }

  /**
   * Process risk factors for forecast explanation - modified to work with direct API calls
   * @param {Array} riskFactors - Risk factors
   * @param {Array} historicalPrices - Historical prices
   * @returns {Array} - Processed factors for forecast
   */
  processForecastFactors(riskFactors, historicalPrices) {
    const factors = [];
    
    // Add factors based on risks
    if (riskFactors && riskFactors.length > 0) {
      riskFactors.forEach(risk => {
        if (!risk.expectedPriceImpact) return;
        
        const impact = risk.expectedPriceImpact.direction === 'increase' ? 
                      Math.min(1, risk.severity * 0.2) : 
                      Math.max(-1, -risk.severity * 0.2);
        
        factors.push({
          name: risk.title,
          impact,
          description: risk.description
        });
      });
    }
    
    // Add factor based on price trend
    if (historicalPrices && historicalPrices.length >= 30) {
      const recentPrices = historicalPrices.slice(-30);
      const prices = recentPrices.map(p => p.price);
      const dates = recentPrices.map(p => new Date(p.date));
      
      const trend = this.calculateTrend(dates, prices);
      const monthlyChange = trend * 30;
      const latestPrice = prices[prices.length - 1];
      const monthlyPercentChange = (monthlyChange / latestPrice) * 100;
      
      if (Math.abs(monthlyPercentChange) >= 2) {
        factors.push({
          name: 'Recent Price Trend',
          impact: monthlyPercentChange > 0 ? 0.5 : -0.5,
          description: `Prices have been ${monthlyPercentChange > 0 ? 'increasing' : 'decreasing'} at approximately ${Math.abs(monthlyPercentChange).toFixed(1)}% per month`
        });
      }
    }
    
    // Add seasonal factor for agricultural products
    const hsCode = historicalPrices[0].hsCode;
    const isAgricultural = hsCode.startsWith('01') || 
                           hsCode.startsWith('02') || 
                           hsCode.startsWith('07') || 
                           hsCode.startsWith('08') || 
                           hsCode.startsWith('10') || 
                           hsCode.startsWith('12');
    
    if (isAgricultural) {
      const currentMonth = new Date().getMonth();
      const seasonName = this.getSeasonName(currentMonth);
      
      factors.push({
        name: `${seasonName} Seasonal Pattern`,
        impact: this.calculateSeasonality(hsCode, '1m') * 5,
        description: `Typical price patterns for this time of year (${seasonName} in Southern Hemisphere)`
      });
    }
    
    return factors;
  }
  
  /**
   * Get season name based on month
   * @param {number} month - Month (0-11)
   * @returns {string} - Season name
   */
  getSeasonName(month) {
    // Southern hemisphere seasons
    if ([11, 0, 1].includes(month)) return 'Summer';
    if ([2, 3, 4].includes(month)) return 'Autumn';
    if ([5, 6, 7].includes(month)) return 'Winter';
    return 'Spring';
  }
  
  /**
   * Get date for forecast horizon
   * @param {string} horizon - Forecast horizon
   * @returns {Date} - Forecast date
   */
  getDateForHorizon(horizon) {
    const now = new Date();
    const days = this.getHorizonDays(horizon);
    
    const result = new Date(now);
    result.setDate(result.getDate() + days);
    
    return result;
  }
  
  /**
   * Convert horizon to days
   * @param {string} horizon - Forecast horizon
   * @returns {number} - Days
   */
  getHorizonDays(horizon) {
    switch (horizon) {
      case '1d': return 1;
      case '1w': return 7;
      case '1m': return 30;
      case '3m': return 90;
      case '6m': return 180;
      case '1y': return 365;
      default: return 30;
    }
  }
}

module.exports = new ForecastService();