// Risk model adapter for Sequelize
const { Risk, RiskRegion, RiskMitigation } = require('../../config/sequelize');

// Export the models
module.exports = Risk;
module.exports.RiskRegion = RiskRegion;
module.exports.RiskMitigation = RiskMitigation;