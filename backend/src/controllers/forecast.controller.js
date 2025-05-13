const Forecast = require('../models/forecast.model');
const Price = require('../models/price.model');
const HSCode = require('../models/hsCode.model');
const Risk = require('../models/risk.model');
const forecastService = require('../services/forecastService');
const { Op } = require('sequelize');

// Helper function to check if forecast needs refresh
const shouldRefreshForecast = (forecast, horizon) => {
  if (!forecast) return true;
  
  const now = new Date();
  const createdAt = new Date(forecast.createdAt);
  
  // Determine refresh threshold based on forecast horizon
  let refreshThresholdHours;
  switch (horizon) {
    case '1d':
      refreshThresholdHours = 6;
      break;
    case '1w':
      refreshThresholdHours = 12;
      break;
    case '1m':
      refreshThresholdHours = 24;
      break;
    case '3m':
    case '6m':
      refreshThresholdHours = 48;
      break;
    case '1y':
      refreshThresholdHours = 72;
      break;
    default:
      refreshThresholdHours = 24;
  }
  
  const refreshThresholdMs = refreshThresholdHours * 60 * 60 * 1000;
  return (now - createdAt) > refreshThresholdMs;
};

// Helper function to get prediction factors from risks
const getFactorsFromRisks = async (hsCode) => {
  const risks = await Risk.findAll({
    where: { isActive: true },
    include: [{
      model: HSCode,
      as: 'affectedHsCodes',
      where: { code: hsCode },
      attributes: []
    }]
  });
  
  return risks.map(risk => ({
    name: risk.title,
    impact: risk.impactDirection === 'increase' ? 
      Math.min(1, risk.severity * 0.2) : 
      Math.max(-1, -risk.severity * 0.2),
    description: risk.description
  }));
};

// Get price forecast for a specific HS code
exports.getForecast = async (req, res, next) => {
  try {
    const { code } = req.params;
    const horizon = req.query.horizon || '1m'; // Default to 1 month
    
    // Validate HS code exists
    const hsCodeExists = await HSCode.findByPk(code);
    if (!hsCodeExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'HS code not found'
      });
    }
    
    // Check if we have a valid recent forecast
    let forecast = await Forecast.findOne({
      where: {
        hsCode: code,
        horizon
      },
      order: [['createdAt', 'DESC']]
    });
    
    // If no forecast or it needs refresh, generate a new one
    if (shouldRefreshForecast(forecast, horizon)) {
      // Get historical price data
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12); // Get 1 year of history
      
      const historicalPrices = await Price.findAll({
        where: {
          hsCode: code,
          date: { 
            [Op.gte]: startDate 
          }
        },
        order: [['date', 'ASC']]
      });
      
      if (historicalPrices.length === 0) {
        return res.status(404).json({
          status: 'fail',
          message: 'Not enough historical price data to generate forecast'
        });
      }
      
      // Get risk factors that might affect the price
      const factors = await getFactorsFromRisks(code);
      
      // Generate new forecast using forecastService
      const newForecastData = await forecastService.generateForecast(
        code,
        horizon,
        historicalPrices,
        factors
      );
      
      // Save to database
      forecast = await Forecast.create(newForecastData);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        forecast,
        productInfo: {
          code,
          description: hsCodeExists.description
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get forecasts for multiple horizons
exports.getMultiHorizonForecasts = async (req, res, next) => {
  try {
    const { code } = req.params;
    const horizons = req.query.horizons ? req.query.horizons.split(',') : ['1m', '3m', '6m'];
    
    // Validate HS code exists
    const hsCodeExists = await HSCode.findByPk(code);
    if (!hsCodeExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'HS code not found'
      });
    }
    
    // Get forecasts for each horizon
    const forecasts = {};
    
    for (const horizon of horizons) {
      let forecast = await Forecast.findOne({
        where: {
          hsCode: code,
          horizon
        },
        order: [['createdAt', 'DESC']]
      });
      
      if (shouldRefreshForecast(forecast, horizon)) {
        // Get historical price data if we haven't already
        let historicalPrices = await Price.findAll({
          where: {
            hsCode: code,
            date: { 
              [Op.gte]: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) 
            }
          },
          order: [['date', 'ASC']]
        });
        
        if (historicalPrices.length === 0) {
          forecasts[horizon] = { error: 'Not enough historical data' };
          continue;
        }
        
        // Get risk factors if we haven't already
        let factors = await getFactorsFromRisks(code);
        
        // Generate new forecast
        try {
          const newForecastData = await forecastService.generateForecast(
            code,
            horizon,
            historicalPrices,
            factors
          );
          
          // Save to database
          forecast = await Forecast.create(newForecastData);
        } catch (err) {
          forecasts[horizon] = { error: 'Failed to generate forecast' };
          continue;
        }
      }
      
      forecasts[horizon] = forecast;
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        forecasts,
        productInfo: {
          code,
          description: hsCodeExists.description
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// Compare forecasts for multiple HS codes
exports.compareForecasts = async (req, res, next) => {
  try {
    const { codes } = req.body; // Array of HS codes
    const horizon = req.query.horizon || '1m';
    
    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an array of HS codes to compare'
      });
    }
    
    // Get forecasts for each HS code
    const results = {};
    
    for (const code of codes) {
      // Get HS code details
      const hsCode = await HSCode.findByPk(code);
      if (!hsCode) {
        results[code] = { error: 'HS code not found' };
        continue;
      }
      
      // Get forecast
      let forecast = await Forecast.findOne({
        where: {
          hsCode: code,
          horizon
        },
        order: [['createdAt', 'DESC']]
      });
      
      if (!forecast || shouldRefreshForecast(forecast, horizon)) {
        // Get necessary data and generate forecast
        try {
          const historicalPrices = await Price.findAll({
            where: {
              hsCode: code,
              date: { 
                [Op.gte]: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) 
              }
            },
            order: [['date', 'ASC']]
          });
          
          if (historicalPrices.length === 0) {
            results[code] = { 
              description: hsCode.description,
              error: 'Not enough historical data' 
            };
            continue;
          }
          
          const factors = await getFactorsFromRisks(code);
          
          const newForecastData = await forecastService.generateForecast(
            code,
            horizon,
            historicalPrices,
            factors
          );
          
          forecast = await Forecast.create(newForecastData);
        } catch (err) {
          results[code] = { 
            description: hsCode.description,
            error: 'Failed to generate forecast' 
          };
          continue;
        }
      }
      
      results[code] = {
        description: hsCode.description,
        forecast
      };
    }
    
    res.status(200).json({
      status: 'success',
      horizon,
      data: results
    });
  } catch (err) {
    next(err);
  }
};