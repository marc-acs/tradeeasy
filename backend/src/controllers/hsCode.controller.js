const { Op } = require('sequelize');
const HSCode = require('../models/hsCode.model');
const User = require('../models/user.model');

// Get all HS codes (with pagination)
exports.getAllHsCodes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;

    // Build query options
    const options = {
      order: [
        ['searchCount', 'DESC'], 
        ['code', 'ASC']
      ],
      offset,
      limit
    };

    // Apply search filter if provided
    if (req.query.search) {
      options.where = {
        [Op.or]: [
          { code: { [Op.iLike]: `%${req.query.search}%` } },
          { description: { [Op.iLike]: `%${req.query.search}%` } }
        ]
      };
    }

    // Apply section filter if provided
    if (req.query.section) {
      options.where = {
        ...options.where,
        section: req.query.section
      };
    }

    // Apply chapter filter if provided
    if (req.query.chapter) {
      options.where = {
        ...options.where,
        chapter: req.query.chapter
      };
    }

    // Find and count all matching records
    const { count, rows: hsCodes } = await HSCode.findAndCountAll(options);

    res.status(200).json({
      status: 'success',
      results: hsCodes.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        totalResults: count
      },
      data: {
        hsCodes
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get single HS code by code
exports.getHsCode = async (req, res, next) => {
  try {
    const hsCode = await HSCode.findByPk(req.params.code);

    if (!hsCode) {
      return res.status(404).json({
        status: 'fail',
        message: 'HS code not found'
      });
    }

    // Increment search count
    hsCode.searchCount += 1;
    hsCode.lastUpdated = new Date();
    await hsCode.save();

    res.status(200).json({
      status: 'success',
      data: {
        hsCode
      }
    });
  } catch (err) {
    next(err);
  }
};

// Create new HS code (admin only)
exports.createHsCode = async (req, res, next) => {
  try {
    const newHsCode = await HSCode.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        hsCode: newHsCode
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update HS code (admin only)
exports.updateHsCode = async (req, res, next) => {
  try {
    const [updated, hsCodes] = await HSCode.update(req.body, {
      where: { code: req.params.code },
      returning: true
    });
    
    if (updated === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'HS code not found'
      });
    }
    
    const hsCode = hsCodes[0];
    
    res.status(200).json({
      status: 'success',
      data: {
        hsCode
      }
    });
  } catch (err) {
    next(err);
  }
};

// Delete HS code (admin only)
exports.deleteHsCode = async (req, res, next) => {
  try {
    const deleted = await HSCode.destroy({
      where: { code: req.params.code }
    });
    
    if (deleted === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'HS code not found'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

// Save HS code to user's saved list
exports.saveHsCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    
    // Verify HS code exists
    const hsCode = await HSCode.findByPk(code);
    if (!hsCode) {
      return res.status(404).json({
        status: 'fail',
        message: 'HS code not found'
      });
    }
    
    // For development mode, just return success
    if (process.env.NODE_ENV === 'development') {
      const savedCodes = ['120190', '020130', '843149', code]; // Add code to default saved codes
      return res.status(200).json({
        status: 'success',
        message: 'HS code saved to your list',
        data: {
          savedHsCodes: savedCodes
        }
      });
    }
    
    // For production mode, update user's saved codes
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Add the HS code to the user's saved list using the association
    await user.addSavedHsCode(hsCode);
    
    // Fetch the updated list of saved HS codes
    const savedHsCodes = await user.getSavedHsCodes();
    const savedHsCodesList = savedHsCodes.map(hsCode => hsCode.code);
    
    res.status(200).json({
      status: 'success',
      message: 'HS code saved to your list',
      data: {
        savedHsCodes: savedHsCodesList
      }
    });
  } catch (err) {
    next(err);
  }
};

// Remove HS code from user's saved list
exports.unsaveHsCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    
    // For development mode, just return success
    if (process.env.NODE_ENV === 'development') {
      const defaultCodes = ['120190', '020130', '843149'];
      const savedCodes = defaultCodes.filter(savedCode => savedCode !== code);
      
      return res.status(200).json({
        status: 'success',
        message: 'HS code removed from your list',
        data: {
          savedHsCodes: savedCodes
        }
      });
    }
    
    // For production mode, update user's saved codes
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    const hsCode = await HSCode.findByPk(code);
    if (hsCode) {
      await user.removeSavedHsCode(hsCode);
    }
    
    // Fetch the updated list of saved HS codes
    const savedHsCodes = await user.getSavedHsCodes();
    const savedHsCodesList = savedHsCodes.map(hsCode => hsCode.code);
    
    res.status(200).json({
      status: 'success',
      message: 'HS code removed from your list',
      data: {
        savedHsCodes: savedHsCodesList
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get user's saved HS codes
exports.getSavedHsCodes = async (req, res, next) => {
  try {
    // For development mode, use default saved HS codes
    if (process.env.NODE_ENV === 'development') {
      const savedCodes = ['120190', '020130', '843149']; // Default saved codes for development
      const hsCodes = await HSCode.findAll({
        where: {
          code: {
            [Op.in]: savedCodes
          }
        }
      });
      
      return res.status(200).json({
        status: 'success',
        results: hsCodes.length,
        data: {
          hsCodes
        }
      });
    }
    
    // For production mode, get saved codes from user
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Get full details of saved HS codes using the association
    const hsCodes = await user.getSavedHsCodes();
    
    res.status(200).json({
      status: 'success',
      results: hsCodes.length,
      data: {
        hsCodes
      }
    });
  } catch (err) {
    next(err);
  }
};