// Tariff model adapter for Sequelize
const { Tariff, TariffSpecialProgram, TariffQuota } = require('../../config/sequelize');
const { Op } = require('sequelize');

// Add static method for backwards compatibility
Tariff.getCurrentTariff = async (hsCode, country) => {
  return await Tariff.findOne({
    where: {
      hsCode,
      country,
      effectiveDate: {
        [Op.lte]: new Date()
      }
    },
    order: [['effectiveDate', 'DESC']]
  });
};

// Export the models
module.exports = Tariff;
module.exports.TariffSpecialProgram = TariffSpecialProgram;
module.exports.TariffQuota = TariffQuota;