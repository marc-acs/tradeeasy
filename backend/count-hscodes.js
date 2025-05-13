require('dotenv').config();
const { Sequelize } = require('sequelize');

async function countHsCodes() {
  // Connect to PostgreSQL
  const sequelize = new Sequelize(
    process.env.POSTGRES_DB || 'tradeeasy',
    process.env.POSTGRES_USER || 'postgres',
    process.env.POSTGRES_PASSWORD,
    {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      dialect: 'postgres',
      logging: false
    }
  );

  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Connected to database');

    // Query count of HS codes by section
    const results = await sequelize.query(
      "SELECT section, COUNT(*) as code_count FROM hs_codes GROUP BY section ORDER BY section",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('HS Codes by section:');
    results.forEach(row => {
      console.log(`Section ${row.section}: ${row.code_count} codes`);
    });
    
    // Count total HS codes
    const totalResult = await sequelize.query(
      "SELECT COUNT(*) as total FROM hs_codes",
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log(`Total HS codes: ${totalResult[0].total}`);
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

countHsCodes();