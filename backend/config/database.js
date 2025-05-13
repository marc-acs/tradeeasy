const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import Sequelize models
const db = require('./sequelize');

// Connect to PostgreSQL
const connectDB = async () => {
  try {
    // Get environment settings
    const isTest = process.env.NODE_ENV === 'test';
    const isDev = process.env.NODE_ENV === 'development';
    const useMemoryDB = process.env.USE_MEMORY_DB === 'true';
    
    // PostgreSQL connection info
    const pgUser = process.env.POSTGRES_USER || 'postgres';
    const pgPassword = process.env.POSTGRES_PASSWORD || 'postgres';
    const pgHost = process.env.POSTGRES_HOST || 'localhost';
    const pgPort = process.env.POSTGRES_PORT || 5432;
    const pgDatabase = isTest ? 
      (process.env.POSTGRES_TEST_DB || 'tradeeasy_test') : 
      (process.env.POSTGRES_DB || 'tradeeasy');
    
    // If using memory DB, use SQLite
    if (useMemoryDB) {
      console.log('Using in-memory SQLite database');
      
      // Create a new Sequelize instance with SQLite in-memory
      const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: isDev ? console.log : false
      });
      
      try {
        // Test connection
        await sequelize.authenticate();
        console.log('SQLite In-Memory Database Connected');
        
        // Sync all models
        await sequelize.sync({ force: true });
        console.log('Database models synchronized');
        
        // Seed the database with initial data
        await seedDatabase();
        
        return sequelize;
      } catch (error) {
        console.error('Unable to connect to the in-memory database:', error);
        throw error;
      }
    } else {
      // Using PostgreSQL
      console.log(`Connecting to PostgreSQL database: ${pgDatabase} on ${pgHost}:${pgPort}`);
      
      // Check if the database exists, if not create it
      if (isDev) {
        try {
          // Connect to postgres database to check if our database exists
          const pool = new Pool({
            user: pgUser,
            password: pgPassword,
            host: pgHost,
            port: pgPort,
            database: 'postgres' // Connect to default postgres database
          });
          
          // Check if our database exists
          const checkResult = await pool.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [pgDatabase]
          );
          
          // If database doesn't exist, create it
          if (checkResult.rowCount === 0) {
            console.log(`Database ${pgDatabase} does not exist, creating it...`);
            await pool.query(`CREATE DATABASE ${pgDatabase}`);
            console.log(`Database ${pgDatabase} created successfully`);
          } else {
            console.log(`Database ${pgDatabase} already exists`);
          }
          
          // Close connection to postgres
          await pool.end();
        } catch (error) {
          console.error('Error checking/creating database:', error);
          console.log('Will attempt to connect to existing database anyway...');
        }
      }
      
      // Now connect to our application database
      try {
        // Authenticate with Sequelize
        await db.sequelize.authenticate();
        console.log('PostgreSQL Database Connected');
        
        // Sync models in development
        if (isDev) {
          await db.sequelize.sync({ alter: true });
          console.log('Database models synchronized');
          
          // Check if database needs seeding (by checking user count)
          const userCount = await db.User.count();
          if (userCount === 0) {
            console.log('No users found in database, seeding initial data');
            await seedDatabase();
          }
        }
        
        return db.sequelize;
      } catch (error) {
        console.error('Unable to connect to the PostgreSQL database:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return null;
  }
};

// Function to seed the database with initial data
const seedDatabase = async () => {
  try {
    console.log('Seeding database with initial data...');
    
    // Import database models
    const { HSCode, User, Risk, Price } = db.sequelize.models;
    
    // Seed HS Codes
    const hsCodes = [
      {
        code: "120190",
        description: "Soybeans, whether or not broken",
        section: "II",
        chapter: "12",
        searchCount: 142
      },
      {
        code: "020130",
        description: "Meat of bovine animals, fresh or chilled, boneless",
        section: "I",
        chapter: "02",
        searchCount: 98
      },
      {
        code: "100199",
        description: "Wheat and meslin (excluding seed for sowing, and durum wheat)",
        section: "II",
        chapter: "10",
        searchCount: 87
      },
      {
        code: "271019",
        description: "Medium oils and preparations, of petroleum or bituminous minerals, not containing biodiesel",
        section: "V",
        chapter: "27",
        searchCount: 76
      },
      {
        code: "760120",
        description: "Aluminum alloys, unwrought",
        section: "XV",
        chapter: "76",
        searchCount: 65
      },
      {
        code: "843149",
        description: "Parts suitable for use solely or principally with the machinery of headings 8426, 8429, and 8430",
        section: "XVI",
        chapter: "84",
        searchCount: 54
      },
      {
        code: "160100",
        description: "Sausages and similar products, of meat, meat offal or blood",
        section: "IV",
        chapter: "16",
        searchCount: 48
      },
      {
        code: "090111",
        description: "Coffee, not roasted, not decaffeinated",
        section: "II",
        chapter: "09",
        searchCount: 62
      }
    ];
    
    // Seed users
    const users = [
      {
        name: "Demo User",
        email: "demo@tradeeasy.com",
        password: "demopassword",
        role: "user",
        company: "TradeEasy Demo Co."
      },
      {
        name: "Admin User",
        email: "admin@tradeeasy.com",
        password: "adminpassword",
        role: "admin",
        company: "TradeEasy Admin"
      }
    ];
    
    // Insert seed data
    try {
      const createdHsCodes = await HSCode.bulkCreate(hsCodes);
      const createdUsers = await User.bulkCreate(users);
      
      // Add saved HS codes for users
      if (createdUsers.length > 0 && createdHsCodes.length > 0) {
        // Demo user saves some HS codes
        const demoUser = createdUsers[0];
        const adminUser = createdUsers[1];
        
        await demoUser.addSavedHsCodes([
          createdHsCodes[0], // 120190
          createdHsCodes[1], // 020130
          createdHsCodes[5]  // 843149
        ]);
        
        await adminUser.addSavedHsCodes([
          createdHsCodes[0], // 120190 
          createdHsCodes[1], // 020130
          createdHsCodes[2], // 100199
          createdHsCodes[3], // 271019
          createdHsCodes[4], // 760120
          createdHsCodes[5]  // 843149
        ]);
      }
      
      // Create some sample price data
      for (const hsCode of hsCodes) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90); // 90 days ago
        
        const priceSeed = Array(30).fill().map((_, i) => {
          // Create a date object for this price point
          const date = new Date(startDate);
          date.setDate(date.getDate() + i * 3); // Every 3 days
          
          // Get base price based on HS code
          let basePrice = 100;
          if (hsCode.code === '120190') basePrice = 14.50;
          else if (hsCode.code === '020130') basePrice = 5.25;
          else if (hsCode.code === '090111') basePrice = 4.25;
          else if (hsCode.code === '160100') basePrice = 15.00;
          
          // Add some randomness to price
          const price = basePrice * (1 + (Math.random() - 0.5) * 0.2);
          
          return {
            hsCode: hsCode.code,
            date,
            price: parseFloat(price.toFixed(2)),
            currency: 'USD',
            unit: hsCode.code === '120190' ? 'bu' : (hsCode.code === '020130' ? 'lb' : 'unit'),
            source: 'Development Data',
            notes: 'Sample price data'
          };
        });
        
        await Price.bulkCreate(priceSeed);
      }
      
      // Load risks from a JSON file if available
      try {
        const risksFilePath = path.join(__dirname, '../src/data/risks.json');
        if (fs.existsSync(risksFilePath)) {
          console.log('Loading risks data from file...');
          const risksData = fs.readFileSync(risksFilePath, 'utf8');
          const risks = JSON.parse(risksData);
          
          // Transform MongoDB risk format to PostgreSQL format
          const riskSeed = risks.map(risk => ({
            type: risk.type,
            severity: risk.severity,
            title: risk.title,
            description: risk.description,
            source: risk.source || 'Unknown',
            sourceUrl: risk.sourceUrl,
            startDate: risk.startDate ? new Date(risk.startDate) : new Date(),
            endDate: risk.endDate ? new Date(risk.endDate) : null,
            impactDirection: risk.expectedPriceImpact?.direction || 'unknown',
            impactPercentage: risk.expectedPriceImpact?.percentage,
            impactConfidence: risk.expectedPriceImpact?.confidence,
            isActive: risk.isActive !== false
          }));
          
          const createdRisks = await Risk.bulkCreate(riskSeed);
          
          // Create associations for risks with HS codes and regions
          for (let i = 0; i < risks.length; i++) {
            const risk = risks[i];
            const createdRisk = createdRisks[i];
            
            // Add affected HS codes
            if (risk.affectedHsCodes && risk.affectedHsCodes.length > 0) {
              const affectedHsCodes = await HSCode.findAll({
                where: {
                  code: risk.affectedHsCodes
                }
              });
              
              if (affectedHsCodes.length > 0) {
                await createdRisk.setAffectedHsCodes(affectedHsCodes);
              }
            }
            
            // Add affected regions
            if (risk.affectedRegions && risk.affectedRegions.length > 0) {
              const { RiskRegion } = db.sequelize.models;
              const regionRecords = risk.affectedRegions.map(region => ({
                riskId: createdRisk.id,
                region
              }));
              
              await RiskRegion.bulkCreate(regionRecords);
            }
            
            // Add mitigation steps
            if (risk.mitigationSteps && risk.mitigationSteps.length > 0) {
              const { RiskMitigation } = db.sequelize.models;
              const stepRecords = risk.mitigationSteps.map((step, index) => ({
                riskId: createdRisk.id,
                step,
                order: index
              }));
              
              await RiskMitigation.bulkCreate(stepRecords);
            }
          }
        }
      } catch (error) {
        console.error('Error seeding risks:', error);
      }
      
      console.log('Database seeded successfully');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  } catch (error) {
    console.error('Error in seedDatabase function:', error);
  }
};

// Check if the database is connected
const isConnected = () => {
  try {
    return db.sequelize && db.sequelize.authenticate() ? true : false;
  } catch (error) {
    return false;
  }
};

module.exports = {
  connectDB,
  isConnected,
  db
};