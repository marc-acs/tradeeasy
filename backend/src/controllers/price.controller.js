const { Op } = require('sequelize');
const Price = require('../models/price.model');
const HSCode = require('../models/hsCode.model');
const quandlService = require('../services/quandlService');

// Get price history for a specific HS code
exports.getPriceHistory = async (req, res, next) => {
  try {
    const { code } = req.params;
    
    // Validate HS code exists
    const hsCodeExists = await HSCode.findByPk(code);
    if (!hsCodeExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'HS code not found'
      });
    }
    
    // Get query parameters for filtering
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // Default 90 days ago
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const currency = req.query.currency || 'USD';
    
    // Get price data from database
    let prices = await Price.findAll({
      where: {
        hsCode: code,
        date: { 
          [Op.gte]: startDate, 
          [Op.lte]: endDate 
        },
        currency
      },
      order: [['date', 'ASC']]
    });
    
    // If no data in database or data is outdated, fetch from external API
    if (prices.length === 0 || prices[prices.length - 1].date < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      const externalPrices = await quandlService.getPriceData(
        code, 
        startDate, 
        endDate
      );
      
      if (externalPrices.length > 0) {
        // Save new data to database
        await Price.bulkCreate(externalPrices);
        
        // Update prices array with new data
        prices = await Price.findAll({
          where: {
            hsCode: code,
            date: { 
              [Op.gte]: startDate, 
              [Op.lte]: endDate 
            },
            currency
          },
          order: [['date', 'ASC']]
        });
      }
    }
    
    // Format data for Chart.js (if specified in query)
    let formattedData = prices;
    if (req.query.format === 'chart') {
      formattedData = {
        labels: prices.map(p => p.date.toISOString().split('T')[0]),
        datasets: [{
          label: `${hsCodeExists.description} (${currency}/${prices[0]?.unit || 'unit'})`,
          data: prices.map(p => p.price),
          borderColor: '#3e95cd',
          fill: false
        }]
      };
    }
    
    res.status(200).json({
      status: 'success',
      results: prices.length,
      timeRange: {
        start: startDate,
        end: endDate
      },
      data: formattedData
    });
  } catch (err) {
    next(err);
  }
};

// Get current price for a specific HS code
exports.getCurrentPrice = async (req, res, next) => {
  try {
    const { code } = req.params;
    
    // Validate HS code exists
    const hsCodeExists = await HSCode.findByPk(code);
    if (!hsCodeExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'HS code not found'
      });
    }
    
    // Get the most recent price
    const price = await Price.findOne({
      where: { hsCode: code },
      order: [['date', 'DESC']]
    });
    
    if (!price) {
      // If no price in database, fetch from external API
      const today = new Date();
      const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1));
      
      const externalPrices = await quandlService.getPriceData(
        code,
        oneMonthAgo,
        new Date()
      );
      
      if (externalPrices.length > 0) {
        // Save new data to database
        await Price.bulkCreate(externalPrices);
        
        // Get the most recent price again
        const newPrice = await Price.findOne({
          where: { hsCode: code },
          order: [['date', 'DESC']]
        });
        
        if (newPrice) {
          return res.status(200).json({
            status: 'success',
            data: {
              price: newPrice
            }
          });
        }
      }
      
      return res.status(404).json({
        status: 'fail',
        message: 'No price data available for this HS code'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        price
      }
    });
  } catch (err) {
    next(err);
  }
};

// Add new price data (admin only)
exports.addPrice = async (req, res, next) => {
  try {
    const newPrice = await Price.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        price: newPrice
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update price data (admin only)
exports.updatePrice = async (req, res, next) => {
  try {
    const [updated, prices] = await Price.update(req.body, {
      where: { id: req.params.id },
      returning: true
    });
    
    if (updated === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Price data not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        price: prices[0]
      }
    });
  } catch (err) {
    next(err);
  }
};

// Delete price data (admin only)
exports.deletePrice = async (req, res, next) => {
  try {
    const deleted = await Price.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Price data not found'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

// Compare prices for multiple HS codes
exports.comparePrices = async (req, res, next) => {
  try {
    const { codes } = req.body; // Array of HS codes
    
    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an array of HS codes to compare'
      });
    }
    
    // Get query parameters for filtering
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const currency = req.query.currency || 'USD';
    
    // Get price data for each HS code
    const results = {};
    
    for (const code of codes) {
      // Get HS code details
      const hsCode = await HSCode.findByPk(code);
      if (!hsCode) {
        results[code] = { error: 'HS code not found' };
        continue;
      }
      
      // Get price data from database
      const prices = await Price.findAll({
        where: {
          hsCode: code,
          date: { 
            [Op.gte]: startDate, 
            [Op.lte]: endDate 
          },
          currency
        },
        order: [['date', 'ASC']]
      });
      
      results[code] = {
        description: hsCode.description,
        prices: prices.map(p => ({
          date: p.date,
          price: p.price,
          unit: p.unit
        }))
      };
    }
    
    res.status(200).json({
      status: 'success',
      timeRange: {
        start: startDate,
        end: endDate
      },
      data: results
    });
  } catch (err) {
    next(err);
  }
};