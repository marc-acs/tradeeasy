/**
 * Price Data Polling Job
 * Fetches fresh price data from external APIs for active commodities
 */
const { Op } = require('sequelize');
const { db } = require('../../../../config/database');
const quandlService = require('../../quandlService');
const fs = require('fs');
const path = require('path');

// Get the log directory
const logDir = path.join(__dirname, '../../../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log file for price data refresh operations
const logFile = path.join(logDir, 'price-data-refresh.log');

/**
 * Log message to the price data refresh log file
 * @param {string} message - Message to log
 */
const logToFile = (message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  fs.appendFileSync(logFile, logEntry);
};

/**
 * Run the price data refresh job
 */
const run = async () => {
  logToFile('Starting price data refresh job');
  
  try {
    // Get all active HS codes (those that have been searched recently or saved by users)
    const activeHsCodes = await getActiveHSCodes();
    
    if (activeHsCodes.length === 0) {
      logToFile('No active HS codes found to refresh');
      return;
    }
    
    logToFile(`Found ${activeHsCodes.length} active HS codes to refresh`);
    
    // Calculate date ranges for data refresh
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    
    // Track results
    let successCount = 0;
    let errorCount = 0;
    let totalPricePoints = 0;
    
    // Process each HS code
    for (const hsCode of activeHsCodes) {
      try {
        logToFile(`Refreshing price data for HS code: ${hsCode}`);
        
        // Fetch fresh data from Quandl
        const newPriceData = await quandlService.getPriceData(hsCode, startDate, endDate);
        
        if (!newPriceData || newPriceData.length === 0) {
          logToFile(`No new price data available for HS code: ${hsCode}`);
          continue;
        }
        
        logToFile(`Retrieved ${newPriceData.length} price points for HS code: ${hsCode}`);
        
        // Insert the new price data
        const result = await saveNewPriceData(hsCode, newPriceData);
        
        successCount++;
        totalPricePoints += result.count;
        
        logToFile(`Successfully updated price data for HS code ${hsCode}: ${result.count} new points, ${result.skipped} skipped`);
      } catch (error) {
        errorCount++;
        logToFile(`Error refreshing price data for HS code ${hsCode}: ${error.message}`);
        console.error(`Price data refresh error for HS code ${hsCode}:`, error);
      }
    }
    
    // Log summary
    logToFile(`Price data refresh job completed: ${successCount} HS codes updated, ${errorCount} errors, ${totalPricePoints} new price points`);
    
    return {
      success: true,
      refreshed: successCount,
      errors: errorCount,
      totalPricePoints
    };
  } catch (error) {
    logToFile(`Price data refresh job failed: ${error.message}`);
    console.error('Price data refresh job error:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get list of active HS codes that should be refreshed
 * @returns {Promise<string[]>} Array of HS codes
 */
const getActiveHSCodes = async () => {
  try {
    const { HSCode, User } = db.sequelize.models;
    
    // Get HS codes with recent search activity (last 30 days)
    const recentlySearched = await HSCode.findAll({
      where: {
        searchCount: {
          [Op.gt]: 0
        },
        lastUpdated: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      attributes: ['code'],
      order: [['searchCount', 'DESC']],
      limit: 50
    });
    
    // Get HS codes saved by users
    const savedByUsers = await User.findAll({
      include: [{
        model: HSCode,
        as: 'savedHsCodes',
        attributes: ['code']
      }]
    });
    
    // Combine and deduplicate
    const savedCodes = savedByUsers
      .flatMap(user => user.savedHsCodes?.map(hs => hs.code) || []);
    
    const recentCodes = recentlySearched.map(hs => hs.code);
    
    // Combine both sets and remove duplicates
    const allCodes = [...new Set([...recentCodes, ...savedCodes])];
    
    return allCodes;
  } catch (error) {
    console.error('Error getting active HS codes:', error);
    logToFile(`Error getting active HS codes: ${error.message}`);
    return [];
  }
};

/**
 * Save new price data to the database
 * @param {string} hsCode - The HS code
 * @param {Array} priceData - Array of price data points
 * @returns {Promise<Object>} Result statistics
 */
const saveNewPriceData = async (hsCode, priceData) => {
  const { Price } = db.sequelize.models;
  const stats = { count: 0, skipped: 0 };
  
  // Process each price point
  for (const pricePoint of priceData) {
    try {
      // Check if we already have this data point
      const existing = await Price.findOne({
        where: {
          hsCode: pricePoint.hsCode,
          date: pricePoint.date
        }
      });
      
      if (existing) {
        stats.skipped++;
        continue;
      }
      
      // Insert new price point
      await Price.create({
        hsCode: pricePoint.hsCode,
        date: pricePoint.date,
        price: pricePoint.price,
        currency: pricePoint.currency,
        unit: pricePoint.unit,
        source: pricePoint.source,
        notes: pricePoint.notes
      });
      
      stats.count++;
    } catch (error) {
      console.error(`Error saving price point for date ${pricePoint.date}:`, error);
    }
  }
  
  return stats;
};

module.exports = { run };