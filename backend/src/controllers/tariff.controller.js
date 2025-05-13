const Tariff = require('../models/tariff.model');
const HSCode = require('../models/hsCode.model');
const tariffService = require('../services/tariffService');
const { Op } = require('sequelize');

// Get current tariff for a specific HS code
exports.getCurrentTariff = async (req, res, next) => {
  try {
    const { code } = req.params;
    const country = req.query.country || 'US';
    
    // Validate HS code exists
    const hsCodeExists = await HSCode.findByPk(code);
    if (!hsCodeExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'HS code not found'
      });
    }
    
    // Get current tariff from database
    let tariff = await Tariff.findOne({
      where: {
        hsCode: code,
        country,
        effectiveDate: {
          [Op.lte]: new Date() // Current or past effective date
        }
      },
      order: [['effectiveDate', 'DESC']] // Get the most recent effective tariff
    });
    
    // If no tariff in database or data is outdated, fetch from external API
    if (!tariff || tariff.lastUpdated < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
      // Only supports fetching US tariffs from USITC
      if (country === 'US') {
        const externalTariff = await tariffService.getTariffInfo(code, country);
        
        if (externalTariff) {
          // Save new data to database
          // Update if exists, create if not
          const [updatedTariff, created] = await Tariff.findOrCreate({
            where: { 
              hsCode: code, 
              country, 
              effectiveDate: externalTariff.effectiveDate 
            },
            defaults: externalTariff
          });
          
          if (!created) {
            // Update the existing record
            await updatedTariff.update(externalTariff);
          }
          
          tariff = updatedTariff;
        }
      }
    }
    
    if (!tariff) {
      return res.status(404).json({
        status: 'fail',
        message: `No tariff data available for this HS code in ${country}`
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        tariff,
        hsCodeDescription: hsCodeExists.description
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get tariff history for a specific HS code
exports.getTariffHistory = async (req, res, next) => {
  try {
    const { code } = req.params;
    const country = req.query.country || 'US';
    
    // Validate HS code exists
    const hsCodeExists = await HSCode.findByPk(code);
    if (!hsCodeExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'HS code not found'
      });
    }
    
    // Get tariff history from database
    const tariffs = await Tariff.findAll({
      where: { 
        hsCode: code, 
        country 
      },
      order: [['effectiveDate', 'DESC']]
    });
    
    res.status(200).json({
      status: 'success',
      results: tariffs.length,
      data: {
        tariffs,
        hsCodeDescription: hsCodeExists.description
      }
    });
  } catch (err) {
    next(err);
  }
};

// Calculate total duties and fees
exports.calculateDuties = async (req, res, next) => {
  try {
    const { 
      hsCode, 
      importValue, 
      country = 'US', 
      specialProgram = null,
      quantity = null,
      quantityUnit = null
    } = req.body;
    
    if (!hsCode || !importValue) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide HS code and import value'
      });
    }
    
    // Validate HS code exists
    const hsCodeExists = await HSCode.findByPk(hsCode);
    if (!hsCodeExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'HS code not found'
      });
    }
    
    // Get current tariff from database
    const tariff = await Tariff.findOne({
      where: {
        hsCode,
        country,
        effectiveDate: {
          [Op.lte]: new Date() // Current or past effective date
        }
      },
      order: [['effectiveDate', 'DESC']] // Get the most recent effective tariff
    });
    
    if (!tariff) {
      return res.status(404).json({
        status: 'fail',
        message: `No tariff data available for this HS code in ${country}`
      });
    }
    
    // Calculate base duty
    let dutyRate = tariff.rate;
    let dutyDescription = 'General duty rate';
    
    // Check if special program applies
    if (specialProgram && tariff.specialPrograms && tariff.specialPrograms.length > 0) {
      const program = tariff.specialPrograms.find(p => p.code === specialProgram);
      
      if (program) {
        dutyRate = program.rate;
        dutyDescription = `${program.name} (${program.code}) rate`;
      }
    }
    
    // Calculate duty amount based on rate type
    let dutyAmount;
    if (tariff.unit === '%') {
      dutyAmount = (importValue * dutyRate) / 100;
    } else if (tariff.unit === 'USD/kg' && quantity && quantityUnit === 'kg') {
      dutyAmount = quantity * dutyRate;
    } else if (tariff.unit === 'USD/unit' && quantity) {
      dutyAmount = quantity * dutyRate;
    } else {
      dutyAmount = (importValue * dutyRate) / 100; // Default to ad valorem if unit type doesn't match provided data
    }
    
    // Calculate additional duties if any
    let additionalDuties = [];
    let additionalDutiesTotal = 0;
    
    if (tariff.additionalDuties && tariff.additionalDuties.length > 0) {
      additionalDuties = tariff.additionalDuties.map(duty => {
        let amount = (importValue * duty.rate) / 100;
        additionalDutiesTotal += amount;
        
        return {
          name: duty.name,
          rate: duty.rate,
          amount,
          description: duty.description
        };
      });
    }
    
    // Merchandise Processing Fee (MPF) - US specific
    let mpf = 0;
    if (country === 'US') {
      const mpfRate = 0.3464; // % (as of 2023)
      const mpfMin = 27.75;
      const mpfMax = 538.40;
      
      mpf = (importValue * mpfRate) / 100;
      if (mpf < mpfMin) mpf = mpfMin;
      if (mpf > mpfMax) mpf = mpfMax;
    }
    
    // Harbor Maintenance Fee (HMF) - US specific, only for ocean shipments
    let hmf = 0;
    if (country === 'US' && req.body.shippingMode === 'ocean') {
      const hmfRate = 0.125; // %
      hmf = (importValue * hmfRate) / 100;
    }
    
    // Total landed cost
    const totalDuties = dutyAmount + additionalDutiesTotal;
    const totalFees = mpf + hmf;
    const totalLandedCost = importValue + totalDuties + totalFees;
    
    res.status(200).json({
      status: 'success',
      data: {
        hsCode,
        description: hsCodeExists.description,
        importValue,
        dutyDetails: {
          rate: dutyRate,
          unit: tariff.unit,
          description: dutyDescription,
          amount: dutyAmount
        },
        additionalDuties,
        fees: {
          mpf,
          hmf
        },
        totals: {
          duties: totalDuties,
          fees: totalFees,
          landedCost: totalLandedCost,
          effectiveDutyRate: (totalDuties / importValue) * 100
        },
        notes: tariff.notes,
        quotaInfo: tariff.quotas,
        lastUpdated: tariff.lastUpdated
      }
    });
  } catch (err) {
    next(err);
  }
};

// Add new tariff data (admin only)
exports.addTariff = async (req, res, next) => {
  try {
    const newTariff = await Tariff.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        tariff: newTariff
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update tariff data (admin only)
exports.updateTariff = async (req, res, next) => {
  try {
    const tariff = await Tariff.findByPk(req.params.id);
    
    if (!tariff) {
      return res.status(404).json({
        status: 'fail',
        message: 'Tariff data not found'
      });
    }
    
    await tariff.update(req.body);
    
    res.status(200).json({
      status: 'success',
      data: {
        tariff
      }
    });
  } catch (err) {
    next(err);
  }
};

// Delete tariff data (admin only)
exports.deleteTariff = async (req, res, next) => {
  try {
    const tariff = await Tariff.findByPk(req.params.id);
    
    if (!tariff) {
      return res.status(404).json({
        status: 'fail',
        message: 'Tariff data not found'
      });
    }
    
    await tariff.destroy();
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};