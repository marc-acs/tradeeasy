require('dotenv').config();
const { connectDB, db } = require('./config/database');

async function testConnection() {
  try {
    console.log('Testing PostgreSQL connection...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('USE_MEMORY_DB:', process.env.USE_MEMORY_DB);
    console.log('PostgreSQL Host:', process.env.POSTGRES_HOST);
    console.log('PostgreSQL DB:', process.env.POSTGRES_DB);
    
    // Connect to database
    const sequelize = await connectDB();
    
    if (!sequelize) {
      console.error('Database connection failed');
      process.exit(1);
    }
    
    console.log('Database connection successful');
    
    // Check for models
    const modelNames = Object.keys(db.sequelize.models);
    console.log(`Available models: ${modelNames.join(', ')}`);
    
    // Test a simple query to confirm it's working
    try {
      // Check HSCode count
      const hsCodeCount = await db.sequelize.models.HSCode.count();
      console.log(`HSCode count: ${hsCodeCount}`);
      
      // Try to fetch one HSCode
      if (hsCodeCount > 0) {
        const hsCode = await db.sequelize.models.HSCode.findOne();
        console.log('Sample HSCode:', hsCode.toJSON());
      }
      
      // Check user count
      const userCount = await db.sequelize.models.User.count();
      console.log(`User count: ${userCount}`);
      
      // Check price data count
      const priceCount = await db.sequelize.models.Price.count();
      console.log(`Price data points: ${priceCount}`);
      
      // Running a sample query with Sequelize
      console.log('Running sample query...');
      const prices = await db.sequelize.models.Price.findAll({
        where: {
          hsCode: '090111' // Coffee
        },
        limit: 5,
        order: [['date', 'DESC']]
      });
      
      console.log(`Found ${prices.length} price records for coffee`);
      if (prices.length > 0) {
        console.log('Sample price data:');
        prices.forEach(price => {
          console.log(`  ${price.date.toISOString().split('T')[0]}: ${price.price} ${price.currency}/${price.unit}`);
        });
      }
      
      console.log('All tests passed!');
    } catch (error) {
      console.error('Query error:', error);
    }
    
    // Close connection
    await sequelize.close();
    console.log('Connection closed');
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testConnection();