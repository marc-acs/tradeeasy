// Simple runner script to set environment and start server
process.env.NODE_ENV = 'development';
// Force use of real MongoDB
process.env.USE_MEMORY_DB = 'false';
process.env.MONGODB_URI = 'mongodb://localhost:27017/tradeeasy';

console.log('Starting with USE_MEMORY_DB =', process.env.USE_MEMORY_DB);

// Start the server
require('./server.js');