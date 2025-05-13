const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import database config
const { connectDB, isConnected } = require('./config/database');

// Import scheduler service
const scheduler = require('./src/services/scheduler');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const hsCodeRoutes = require('./src/routes/hsCode.routes');
const priceRoutes = require('./src/routes/price.routes');
const tariffRoutes = require('./src/routes/tariff.routes');
const riskRoutes = require('./src/routes/risk.routes');
const forecastRoutes = require('./src/routes/forecast.routes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (needed for rate limiting to work properly behind a proxy)
// Setting to trust first proxy in the chain - required for proper rate limiting when behind reverse proxies
// This fixes the "ERR_ERL_UNEXPECTED_X_FORWARDED_FOR" error
app.set('trust proxy', 1);

// Middleware
app.use(helmet()); // Security headers

// Configure CORS with specific options 
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow these origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow cookies to be sent with requests
}));

// Also add a CORS preflight handler
app.options('*', cors()); // Enable pre-flight for all routes

app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Logging

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip X-Forwarded-For header validation in development environment
  skipFailedRequests: true, // Don't count failed requests against the limit
  validate: { 
    xForwardedForHeader: false // Disable X-Forwarded-For validation to fix the warning
  }
});
app.use('/api/', apiLimiter);

// Development mode authentication bypass
const developmentAuthBypass = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    // Create a mock user for development with Sequelize structure
    req.user = {
      id: 1, // Sequelize uses 'id' instead of '_id'
      name: 'Demo User',
      email: 'demo@tradeeasy.com',
      role: 'admin',
      company: 'TradeEasy Demo Co.',
      // Note: In Sequelize, we don't directly store savedHsCodes in the user object
      // They are retrieved using association methods, but for development bypass
      // we'll include the IDs directly for backward compatibility
      savedHsCodes: ['120190', '020130', '843149']
    };
  }
  next();
};

// Note: The mock data middleware is imported but NOT used in production mode
// It's kept for reference only - the app is configured to return 503 errors when the database is unavailable
const mockDataMiddleware = require('./src/utils/mockDataMiddleware');

// Route middleware
const setupRouteWithFallback = (path, authMiddleware, routes) => {
  // Set up routes - strict mode, no mock data
  app.use(path, authMiddleware, (req, res, next) => {
    // Check if PostgreSQL is connected - return 503 error if not connected
    // This enforces strict data mode - no fallback to mock data
    if (!isConnected()) {
      return res.status(503).json({
        status: 'error',
        message: 'Database service unavailable. Please try again later.'
      });
    }
    
    // Continue to real routes with real data only
    next();
  }, routes);
};

// Routes with strict data requirements - will return 503 if database is unavailable
app.use('/api/auth', authRoutes);

// Add routes with alternate capitalization for better compatibility with frontend
// Original routes
setupRouteWithFallback('/api/hscode', developmentAuthBypass, hsCodeRoutes);
setupRouteWithFallback('/api/prices', developmentAuthBypass, priceRoutes);
setupRouteWithFallback('/api/tariffs', developmentAuthBypass, tariffRoutes);
setupRouteWithFallback('/api/risks', developmentAuthBypass, riskRoutes);
setupRouteWithFallback('/api/forecasts', developmentAuthBypass, forecastRoutes);

// Case-insensitive alternates for better compatibility
setupRouteWithFallback('/api/hsCode', developmentAuthBypass, hsCodeRoutes); // Capitalized version
setupRouteWithFallback('/api/HSCode', developmentAuthBypass, hsCodeRoutes); // Fully capitalized
setupRouteWithFallback('/api/hs-code', developmentAuthBypass, hsCodeRoutes); // Kebab case version

// Health check endpoint with DB status
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    database: isConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Start server and connect to PostgreSQL
const startServer = async () => {
  try {
    // Connect to PostgreSQL
    await connectDB();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Database status: ${isConnected() ? 'Connected' : 'Disconnected'}`);
      
      if (!isConnected()) {
        console.log('WARNING: Database is not connected - data operations will fail');
      } else {
        const isMemoryDb = process.env.USE_MEMORY_DB === 'true';
        console.log(`Using ${isMemoryDb ? 'in-memory SQLite' : 'PostgreSQL'} - mock data disabled`);
      }
      
      // Initialize the scheduler service
      const schedulerInitialized = scheduler.initScheduler();
      console.log(`Scheduler service: ${schedulerInitialized ? 'Initialized' : 'Disabled'}`);
    });
  } catch (err) {
    console.error(`Failed to start server: ${err.message}`);
  }
};

// Start the server
startServer();

// Enhanced error handling middleware with Sequelize-specific error handling
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.stack}`);
  
  // Handle Sequelize specific errors
  let statusCode = 500;
  let errorMessage = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  
  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    errorMessage = err.errors.map(val => val.message).join(', ');
  }
  
  // Sequelize unique constraint errors
  else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    const field = err.errors[0].path;
    errorMessage = `Duplicate value for ${field}. This ${field} already exists.`;
  }
  
  // Sequelize foreign key constraint errors
  else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    errorMessage = `Invalid reference: ${err.parent.detail}`;
  }
  
  // JSON parsing errors
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    errorMessage = 'Invalid JSON in request body';
  }
  
  // Sequelize connection errors
  else if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
    statusCode = 503;
    errorMessage = 'Database service unavailable. Please try again later.';
  }
  
  // JWT errors
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorMessage = 'Invalid or expired token. Please log in again.';
  }
  
  // Return error response
  res.status(statusCode).json({
    error: true,
    message: errorMessage,
    // Include error details in non-production environments
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: err.stack,
      type: err.name
    })
  });
  
  // Log error to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // This would integrate with a proper logging/monitoring service
    // logErrorToMonitoringService(err, req);
  }
});

module.exports = app; // For testing