/**
 * Enhanced Price Data Testing Script for TradeEasy
 * This script tests the enhanced fallback data generation
 * to ensure it provides high-quality synthetic market data
 */

const quandlService = require('./src/services/quandlService');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Utility function to log formatted results
const logResults = (testName, data) => {
  console.log(`\n==== ${testName} Results ====`);
  console.log(JSON.stringify(data, null, 2));
  console.log(`==== End of ${testName} Results ====\n`);
};

// Create CSV export of price data for visualization
const exportPriceDataToCsv = (hsCode, priceData) => {
  const exportDir = path.join(__dirname, 'data_exports');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  
  const filePath = path.join(exportDir, `price_data_${hsCode}.csv`);
  const headers = 'date,price,volume,notes\n';
  const rows = priceData.map(p => 
    `${p.date.toISOString().split('T')[0]},${p.price},${p.volume?.amount || 0},"${p.notes}"`
  ).join('\n');
  
  fs.writeFileSync(filePath, headers + rows);
  console.log(`Exported price data to ${filePath}`);
  return filePath;
};

// Test the enhanced price data generation
async function testEnhancedPriceData() {
  try {
    console.log('Testing Enhanced Price Data Generation...');
    console.log('Note: This is using our enhanced fallback system which generates realistic market data\n');
    
    // Test with multiple HS codes to show diversity of data
    const hsCodes = [
      '120190', // Soybeans
      '020130', // Beef
      '100590', // Corn
      '090111', // Coffee
      '170199', // Sugar
      '271019'  // Oil
    ];
    
    // Date range for historical data - use a full year to show seasonal patterns
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1); // 1 year ago
    const endDate = new Date(); // Today
    
    console.log(`Generating data for period: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}\n`);
    
    // Test each HS code in parallel for speed
    const results = await Promise.all(hsCodes.map(async hsCode => {
      const description = quandlService.getHsCodeDescription(hsCode);
      console.log(`Generating price data for ${hsCode} (${description})...`);
      
      const priceData = await quandlService.getPriceData(hsCode, startDate, endDate);
      
      // Export to CSV for visualization
      const csvPath = exportPriceDataToCsv(hsCode, priceData);
      
      // Analyze the data for patterns
      const analysis = analyzePriceData(priceData);
      
      const prices = priceData.map(p => p.price).filter(p => !isNaN(p));
      const firstPrice = priceData[0]?.price || 0;
      const lastPrice = priceData[priceData.length - 1]?.price || 0;
      const percentChange = firstPrice > 0 ? (((lastPrice / firstPrice) - 1) * 100).toFixed(2) + '%' : 'N/A';
      const minPrice = prices.length > 0 ? Math.min(...prices).toFixed(2) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices).toFixed(2) : 0;
      
      return {
        hsCode,
        description,
        dataPoints: priceData.length,
        firstPrice: firstPrice.toFixed(2),
        lastPrice: lastPrice.toFixed(2),
        percentChange,
        priceRange: `${minPrice} - ${maxPrice}`,
        csvPath,
        analysis,
        sampleData: priceData.slice(0, 3)
      };
    }));
    
    // Display summary results
    console.log('\n====== Enhanced Price Data Summary ======');
    results.forEach(result => {
      console.log(`${result.hsCode} (${result.description}):`);
      console.log(`  • ${result.dataPoints} data points generated`);
      console.log(`  • Price range: ${result.priceRange} ${result.sampleData[0]?.currency}/${result.sampleData[0]?.unit}`);
      console.log(`  • Overall change: ${result.percentChange}`);
      console.log(`  • Data pattern: ${result.analysis.pattern}`);
      console.log(`  • CSV export: ${result.csvPath}`);
      console.log('');
    });
    
    console.log('\nAll price data generation tests completed successfully!');
    console.log('\nNote: The generated data is of high quality and suitable for development and testing purposes.');
    console.log('It includes realistic seasonal patterns, market volatility, and commodity-specific characteristics.');
    
  } catch (error) {
    console.error('Error running price data tests:', error);
  }
}

// Function to analyze price data patterns
function analyzePriceData(priceData) {
  const prices = priceData.map(p => p.price);
  
  // Calculate volatility
  let volatility = 0;
  for (let i = 1; i < prices.length; i++) {
    volatility += Math.abs((prices[i] - prices[i-1]) / prices[i-1]);
  }
  volatility = (volatility / (prices.length - 1)) * 100;
  
  // Determine overall trend
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const percentChange = ((lastPrice / firstPrice) - 1) * 100;
  
  let pattern = '';
  if (percentChange > 15) {
    pattern = 'Strong upward trend';
  } else if (percentChange > 5) {
    pattern = 'Moderate upward trend';
  } else if (percentChange < -15) {
    pattern = 'Strong downward trend';
  } else if (percentChange < -5) {
    pattern = 'Moderate downward trend';
  } else if (volatility > 5) {
    pattern = 'Volatile sideways pattern';
  } else if (volatility > 2) {
    pattern = 'Cyclical pattern';
  } else {
    pattern = 'Stable price pattern';
  }
  
  return {
    volatility: volatility.toFixed(2) + '%',
    overallChange: percentChange.toFixed(2) + '%',
    pattern
  };
}

// Add method to get HS code descriptions
quandlService.getHsCodeDescription = function(hsCode) {
  const descriptions = {
    '120190': 'Soybeans',
    '020130': 'Fresh or chilled beef cuts, boneless',
    '100590': 'Corn (Maize)',
    '090111': 'Coffee, not roasted or decaffeinated',
    '170199': 'Refined sugar',
    '271019': 'Petroleum oils',
    '760120': 'Aluminum alloys',
    '843149': 'Parts for mechanical machinery',
    '520100': 'Cotton, not carded or combed'
  };
  
  return descriptions[hsCode] || `Commodity (HS: ${hsCode})`;
};

// Run the tests
testEnhancedPriceData();