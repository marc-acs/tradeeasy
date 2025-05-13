const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Create JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Send JWT as cookie and JSON response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id); // Using id instead of _id for Sequelize
  
  // Remove password from output
  const userObject = user.toJSON();
  delete userObject.password;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: userObject
    }
  });
};

// Register new user
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, company } = req.body;

    // Check if email is already in use
    const existingUser = await User.findOne({ 
      where: { email } 
    });
    
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already in use'
      });
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      company
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    next(err);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password provided
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.scope('withPassword').findOne({
      where: { email }
    });

    // Check if user exists and password is correct
    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  // DEVELOPMENT MODE BYPASS - skip authentication in development
  if (process.env.NODE_ENV === 'development') {
    // Create a mock user for development
    req.user = {
      id: 1, // Changed from _id to id for Sequelize
      name: 'Demo User',
      email: 'demo@tradeeasy.com',
      role: 'admin',
      company: 'TradeEasy Demo Co.',
      // Note: In Sequelize, saved HS codes would be accessed via association method
      savedHsCodes: ['120190', '020130', '843149'],
      changedPasswordAfter: () => false // Mock function to pass checks
    };
    return next();
  }

  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findByPk(decoded.id, {
      include: ['savedHsCodes'] // Include saved HS codes association
    });
    
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'fail',
        message: 'User recently changed password. Please log in again.'
      });
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token. Please log in again.'
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Your token has expired. Please log in again.'
      });
    }
    next(err);
  }
};

// Restrict actions based on user role
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // In development mode, allow all actions
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

// Get current user profile
exports.getMe = async (req, res, next) => {
  try {
    // We already have the user from the protect middleware
    // but we re-fetch to get the most up-to-date data and ensure
    // we have all the needed associations
    const user = await User.findByPk(req.user.id, {
      include: ['savedHsCodes']
    });
    
    // Remove sensitive data
    const userJSON = user.toJSON();
    delete userJSON.password;
    
    res.status(200).json({
      status: 'success',
      data: {
        user: userJSON
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update user profile
exports.updateMe = async (req, res, next) => {
  try {
    const { name, email, company } = req.body;

    // Create filtered object with allowed fields
    const filteredBody = {};
    if (name) filteredBody.name = name;
    if (email) filteredBody.email = email;
    if (company) filteredBody.company = company;

    // Find user first
    const user = await User.findByPk(req.user.id);
    
    // Update user
    await user.update(filteredBody);

    // Get the updated user with associations
    const updatedUser = await User.findByPk(user.id, {
      include: ['savedHsCodes']
    });

    // Remove sensitive data
    const userJSON = updatedUser.toJSON();
    delete userJSON.password;

    res.status(200).json({
      status: 'success',
      data: {
        user: userJSON
      }
    });
  } catch (err) {
    next(err);
  }
};