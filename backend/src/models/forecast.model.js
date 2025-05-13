// Forecast model adapter for Sequelize
const { Forecast, ForecastFactor } = require('../../config/sequelize');

// Export the models
module.exports = Forecast;
module.exports.ForecastFactor = ForecastFactor;