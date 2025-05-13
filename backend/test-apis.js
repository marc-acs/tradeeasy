/**
 * API Testing Script for TradeEasy
 * This script tests the direct API connections to external data providers
 * without relying on MongoDB.
 */

const quandlService = require('./src/services/quandlService');
const weatherService = require('./src/services/weatherService');
const tariffService = require('./src/services/tariffService');
const forecastService = require('./src/services/forecastService');

// Utility function to log formatted results
const logResults = (apiName, data) => {
  console.log(`\n==== ${apiName} API Results ====`);
  console.log(JSON.stringify(data, null, 2));
  console.log(`==== End of ${apiName} Results ====\n`);
};

// Test all APIs
async function testAllApis() {
  try {
    console.log('Starting API tests...');
    
    // Test parameters
    const hsCode = '120190'; // Soybeans
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6); // 6 months ago
    const endDate = new Date(); // Today
    
    // Test Quandl API (Price data)
    console.log('\nTesting Quandl API for price data...');
    try {
      const priceData = await quandlService.getPriceData(hsCode, startDate, endDate);
      logResults('Quandl Price', {
        hsCode,
        dataPoints: priceData.length,
        latestPrice: priceData[priceData.length - 1],
        source: priceData[0]?.source || 'Unknown'
      });
    } catch (error) {
      console.error('Quandl API error:', error.message);
    }
    
    // Test Weather API
    console.log('\nTesting OpenWeatherMap API...');
    try {
      const region = 'Argentina';
      const weatherRisks = await weatherService.getWeatherForecast(region);
      logResults('OpenWeatherMap', {
        region,
        risksFound: weatherRisks.length,
        risksSample: weatherRisks.slice(0, 2),
        source: weatherRisks[0]?.source || 'Unknown'
      });
    } catch (error) {
      console.error('OpenWeatherMap API error:', error.message);
    }
    
    // Test Tariff API
    console.log('\nTesting USITC API for tariff data...');
    try {
      const tariffInfo = await tariffService.getTariffInfo(hsCode, 'US');
      logResults('USITC Tariff', {
        hsCode,
        tariffData: tariffInfo,
        source: tariffInfo?.source || 'Unknown'
      });
    } catch (error) {
      console.error('USITC API error:', error.message);
    }
    
    // Test forecast directly
    console.log('\nTesting forecast generation with API data...');
    try {
      // Create sample price data (normally from database)
      const priceData = await quandlService.getPriceData(hsCode, startDate, endDate);
      
      // Create sample risk data (normally from database)
      const weatherRisks = await weatherService.getWeatherForecast('Argentina');
      
      // Generate forecast
      const forecast = await forecastService.generateForecast(
        hsCode,
        '3m', // 3-month forecast
        priceData,
        weatherRisks
      );
      
      logResults('Price Forecast', {
        hsCode,
        forecastDate: forecast.date,
        predictedPrice: forecast.predictedPrice,
        confidenceInterval: forecast.confidenceInterval,
        confidenceScore: forecast.confidenceScore,
        factorsCount: forecast.factors.length,
        factors: forecast.factors
      });
    } catch (error) {
      console.error('Forecast generation error:', error.message);
    }
    
    console.log('\nAPI tests completed\!');
    
  } catch (error) {
    console.error('Error running API tests:', error);
  }
}

// Run the tests
testAllApis();
