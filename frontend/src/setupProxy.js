const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('🚀 Setting up proxy middleware...');
  
  // Log all incoming requests first (for all requests)
  app.use((req, res, next) => {
    console.log(`🔍 Request received: ${req.method} ${req.url}`);
    next();
  });
  
  // Create a direct health check endpoint to test proxy setup
  app.use('/proxy-check', (req, res) => {
    console.log('Proxy check endpoint called');
    res.json({ status: 'PROXY_WORKING', message: 'The proxy middleware is working!' });
  });
  
  // Set up the proxy for /api route
  const apiProxy = createProxyMiddleware({
    target: 'http://localhost:5000',
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
      console.log(`📤 PROXY: ${req.method} ${req.url} -> ${proxyReq.method} ${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`📥 PROXY RESPONSE: ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      console.error(`❌ PROXY ERROR for ${req.url}:`, err.message);
      
      res.writeHead(500, {
        'Content-Type': 'application/json',
      });
      
      res.end(JSON.stringify({
        status: 'error',
        message: 'Error connecting to backend server. Please try again or check if the backend is running.',
        endpoint: req.url,
        error: err.message
      }));
    }
  });
  
  // Apply proxy to all /api paths
  console.log('🔌 Applying proxy for /api/* paths...');
  app.use('/api', apiProxy);
  
  // Also set up explicit route for hscode to ensure it works
  app.use('/api/hscode', apiProxy);
  app.use('/api/hsCode', apiProxy);
  app.use('/api/hs-code', apiProxy);
  
  console.log('✅ Proxy middleware setup complete');
};