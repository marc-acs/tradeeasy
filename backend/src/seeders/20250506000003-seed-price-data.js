'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Function to create sample price data for an HS code
    const createPriceData = (hsCode, basePrice, days = 90) => {
      const priceData = [];
      const now = new Date();
      let unit = 'unit';
      
      // Set unit based on HS code
      if (hsCode === '120190') unit = 'bu';
      else if (hsCode === '020130') unit = 'lb';
      else if (hsCode === '090111') unit = 'lb';
      
      // Generate price data for the past 90 days
      for (let i = 0; i < days; i += 3) { // Every 3 days
        const date = new Date(now);
        date.setDate(date.getDate() - (days - i));
        
        // Add some randomness to price (10% variation)
        const randomFactor = 0.9 + (Math.random() * 0.2);
        const price = basePrice * randomFactor;
        
        priceData.push({
          id: uuidv4(),
          hsCode,
          date,
          price: parseFloat(price.toFixed(2)),
          currency: 'USD',
          unit,
          source: 'Development Data',
          notes: 'Sample price data',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      return priceData;
    };
    
    // Generate price data for each HS code
    const allPriceData = [
      ...createPriceData('120190', 14.50), // Soybeans
      ...createPriceData('020130', 5.25),  // Beef
      ...createPriceData('100199', 7.80),  // Wheat
      ...createPriceData('271019', 85.00), // Oil
      ...createPriceData('760120', 2.45),  // Aluminum
      ...createPriceData('843149', 120.00), // Machinery parts
      ...createPriceData('160100', 15.00), // Sausages
      ...createPriceData('090111', 4.25)   // Coffee
    ];
    
    // Seed the price data
    return queryInterface.bulkInsert('prices', allPriceData);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('prices', null, {});
  }
};