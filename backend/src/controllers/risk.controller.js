const Risk = require('../models/risk.model');
const HSCode = require('../models/hsCode.model');
const weatherService = require('../services/weatherService');
const { Op } = require('sequelize');

// Get active risks for a specific HS code
exports.getRisksForHsCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    
    // Validate HS code exists
    const hsCodeExists = await HSCode.findByPk(code);
    if (!hsCodeExists) {
      return res.status(404).json({
        status: 'fail',
        message: 'HS code not found'
      });
    }
    
    // Get risks from database that affect this HS code
    const risks = await Risk.findAll({
      where: {
        isActive: true
      },
      include: [{
        model: HSCode,
        as: 'affectedHsCodes',
        where: { code },
        attributes: []
      }],
      order: [
        ['severity', 'DESC'],
        ['startDate', 'ASC']
      ]
    });
    
    res.status(200).json({
      status: 'success',
      results: risks.length,
      data: {
        risks
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get risks by region
exports.getRisksByRegion = async (req, res, next) => {
  try {
    const { region } = req.params;
    
    // Get risks from database for this region
    const storedRisks = await Risk.findAll({
      include: [{
        model: Risk.sequelize.models.RiskRegion,
        as: 'regions',
        where: { region },
        attributes: []
      }],
      where: {
        isActive: true
      },
      order: [
        ['severity', 'DESC'],
        ['startDate', 'ASC']
      ]
    });
    
    // Check if we need to fetch fresh weather data
    const lastWeatherRisk = await Risk.findOne({
      include: [{
        model: Risk.sequelize.models.RiskRegion,
        as: 'regions',
        where: { region },
        attributes: []
      }],
      where: {
        type: 'weather',
        source: 'OpenWeatherMap'
      },
      order: [['createdAt', 'DESC']]
    });
    
    let combinedRisks = [...storedRisks];
    
    // If no weather risks or last one is older than 6 hours, fetch new ones
    if (!lastWeatherRisk || 
        lastWeatherRisk.createdAt < new Date(Date.now() - 6 * 60 * 60 * 1000)) {
      const weatherRisks = await weatherService.getWeatherForecast(region);
      
      if (weatherRisks.length > 0) {
        // Save new weather risks to database
        const createdRisks = await Risk.bulkCreate(weatherRisks);
        
        // Add regions to each risk
        for (const risk of createdRisks) {
          await risk.createRegion({ region });
        }
        
        // Combine with stored risks, removing duplicates
        const existingRiskTitles = storedRisks.map(r => r.title);
        const newWeatherRisks = weatherRisks.filter(r => !existingRiskTitles.includes(r.title));
        
        combinedRisks = [...storedRisks, ...newWeatherRisks];
      }
    }
    
    res.status(200).json({
      status: 'success',
      results: combinedRisks.length,
      data: {
        risks: combinedRisks
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get weather forecast for a region directly (new endpoint)
exports.getWeatherForecast = async (req, res, next) => {
  try {
    // Validate request body
    if (!req.body || !req.body.region) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a region in the request body'
      });
    }
    
    const { region } = req.body;
    
    // Get weather forecast directly from service
    const weatherRisks = await weatherService.getWeatherForecast(region);
    
    // Return the weather data without saving to database
    res.status(200).json({
      status: 'success',
      results: weatherRisks.length,
      data: {
        risks: weatherRisks,
        region
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get all active risks (with pagination)
exports.getAllRisks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;
    
    // Build query conditions
    const whereConditions = {};
    
    // Filter by active status
    if (req.query.active === 'true') {
      whereConditions.isActive = true;
    } else if (req.query.active === 'false') {
      whereConditions.isActive = false;
    }
    
    // Filter by type
    if (req.query.type) {
      whereConditions.type = req.query.type;
    }
    
    // Filter by minimum severity
    if (req.query.minSeverity) {
      whereConditions.severity = {
        [Op.gte]: parseInt(req.query.minSeverity, 10)
      };
    }
    
    // Get count and risks with pagination
    const { count, rows: risks } = await Risk.findAndCountAll({
      where: whereConditions,
      order: [
        ['severity', 'DESC'],
        ['startDate', 'ASC']
      ],
      offset,
      limit
    });
    
    res.status(200).json({
      status: 'success',
      results: risks.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        totalResults: count
      },
      data: {
        risks
      }
    });
  } catch (err) {
    next(err);
  }
};

// Create new risk alert (admin only)
exports.createRisk = async (req, res, next) => {
  try {
    const newRisk = await Risk.create(req.body);
    
    // Handle associations if they exist in the request
    if (req.body.affectedHsCodes && Array.isArray(req.body.affectedHsCodes)) {
      await newRisk.setAffectedHsCodes(req.body.affectedHsCodes);
    }
    
    if (req.body.affectedRegions && Array.isArray(req.body.affectedRegions)) {
      for (const region of req.body.affectedRegions) {
        await newRisk.createRegion({ region });
      }
    }
    
    if (req.body.mitigationSteps && Array.isArray(req.body.mitigationSteps)) {
      for (let i = 0; i < req.body.mitigationSteps.length; i++) {
        await newRisk.createMitigation({
          step: req.body.mitigationSteps[i],
          order: i
        });
      }
    }
    
    // Get the complete risk with all associations
    const completeRisk = await Risk.findByPk(newRisk.id, {
      include: ['affectedHsCodes', 'regions', 'mitigations']
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        risk: completeRisk
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update risk alert (admin only)
exports.updateRisk = async (req, res, next) => {
  try {
    // First find the risk
    const risk = await Risk.findByPk(req.params.id);
    
    if (!risk) {
      return res.status(404).json({
        status: 'fail',
        message: 'Risk alert not found'
      });
    }
    
    // Update main risk fields
    await risk.update(req.body);
    
    // Handle associations if they exist in the request
    if (req.body.affectedHsCodes && Array.isArray(req.body.affectedHsCodes)) {
      await risk.setAffectedHsCodes(req.body.affectedHsCodes);
    }
    
    if (req.body.affectedRegions && Array.isArray(req.body.affectedRegions)) {
      // Remove existing regions first
      await risk.sequelize.models.RiskRegion.destroy({
        where: { riskId: risk.id }
      });
      
      // Create new regions
      for (const region of req.body.affectedRegions) {
        await risk.createRegion({ region });
      }
    }
    
    if (req.body.mitigationSteps && Array.isArray(req.body.mitigationSteps)) {
      // Remove existing mitigations first
      await risk.sequelize.models.RiskMitigation.destroy({
        where: { riskId: risk.id }
      });
      
      // Create new mitigations
      for (let i = 0; i < req.body.mitigationSteps.length; i++) {
        await risk.createMitigation({
          step: req.body.mitigationSteps[i],
          order: i
        });
      }
    }
    
    // Get the updated risk with all associations
    const updatedRisk = await Risk.findByPk(risk.id, {
      include: ['affectedHsCodes', 'regions', 'mitigations']
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        risk: updatedRisk
      }
    });
  } catch (err) {
    next(err);
  }
};

// Delete risk alert (admin only)
exports.deleteRisk = async (req, res, next) => {
  try {
    const risk = await Risk.findByPk(req.params.id);
    
    if (!risk) {
      return res.status(404).json({
        status: 'fail',
        message: 'Risk alert not found'
      });
    }
    
    await risk.destroy();
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

// Mark risk as inactive (admin only)
exports.deactivateRisk = async (req, res, next) => {
  try {
    const risk = await Risk.findByPk(req.params.id);
    
    if (!risk) {
      return res.status(404).json({
        status: 'fail',
        message: 'Risk alert not found'
      });
    }
    
    await risk.update({
      isActive: false,
      updatedAt: new Date()
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        risk
      }
    });
  } catch (err) {
    next(err);
  }
};