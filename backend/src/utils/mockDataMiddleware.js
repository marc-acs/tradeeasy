// Mock data middleware for development without MongoDB
const fs = require('fs');
const path = require('path');

// Load mock data
const mockData = {
  hsCodes: [
    {
      "_id": "60a1c1b3d8b1c3a4b5a6c7d8",
      "code": "120190",
      "description": "Soybeans, whether or not broken",
      "section": "II",
      "chapter": "12",
      "heading": "1201",
      "notes": "Most traded agricultural commodity, primarily used for animal feed and oil production",
      "searchCount": 142,
      "lastUpdated": "2023-05-15T12:30:45Z"
    },
    {
      "_id": "60a1c1b3d8b1c3a4b5a6c7d9",
      "code": "020130",
      "description": "Meat of bovine animals, fresh or chilled, boneless",
      "section": "I",
      "chapter": "02",
      "heading": "0201",
      "notes": "High-quality cuts of beef, includes tenderloin, ribeye, and strip loin",
      "searchCount": 98,
      "lastUpdated": "2023-06-22T09:15:30Z"
    },
    {
      "_id": "60a1c1b3d8b1c3a4b5a6c7da",
      "code": "100199",
      "description": "Wheat and meslin (excluding seed for sowing, and durum wheat)",
      "section": "II",
      "chapter": "10",
      "heading": "1001",
      "notes": "Common wheat used for bread, flour, and various food products",
      "searchCount": 87,
      "lastUpdated": "2023-05-30T14:20:15Z"
    },
    {
      "_id": "60a1c1b3d8b1c3a4b5a6c7db",
      "code": "271019",
      "description": "Medium oils and preparations, of petroleum or bituminous minerals, not containing biodiesel",
      "section": "V",
      "chapter": "27",
      "heading": "2710",
      "notes": "Includes diesel fuel, heating oil, and other petroleum-based oils",
      "searchCount": 76,
      "lastUpdated": "2023-07-12T11:10:25Z"
    },
    {
      "_id": "60a1c1b3d8b1c3a4b5a6c7dc",
      "code": "760120",
      "description": "Aluminum alloys, unwrought",
      "section": "XV",
      "chapter": "76",
      "heading": "7601",
      "notes": "Base material for production of various aluminum products",
      "searchCount": 65,
      "lastUpdated": "2023-08-03T16:05:40Z"
    },
    {
      "_id": "60a1c1b3d8b1c3a4b5a6c7dd",
      "code": "843149",
      "description": "Parts suitable for use solely or principally with the machinery of headings 8426, 8429, and 8430",
      "section": "XVI",
      "chapter": "84",
      "heading": "8431",
      "notes": "Parts for construction and mining equipment",
      "searchCount": 54,
      "lastUpdated": "2023-09-18T10:25:35Z"
    }
  ],
  users: [
    {
      "_id": "60a1c1b3d8b1c3a4b5a6c7de",
      "name": "Demo User",
      "email": "demo@tradeeasy.com",
      "role": "user",
      "company": "TradeEasy Demo Co.",
      "savedHsCodes": ["120190", "020130", "843149"],
      "createdAt": "2023-03-15T09:30:00Z"
    },
    {
      "_id": "60a1c1b3d8b1c3a4b5a6c7df",
      "name": "Admin User",
      "email": "admin@tradeeasy.com",
      "role": "admin",
      "company": "TradeEasy Admin",
      "savedHsCodes": ["120190", "020130", "843149", "100199", "271019", "760120"],
      "createdAt": "2023-01-10T11:45:30Z"
    }
  ],
  prices: {
    "120190": [
      { "date": "2023-01-01", "price": 14.23, "currency": "USD", "unit": "bushel" },
      { "date": "2023-02-01", "price": 14.56, "currency": "USD", "unit": "bushel" },
      { "date": "2023-03-01", "price": 14.87, "currency": "USD", "unit": "bushel" },
      { "date": "2023-04-01", "price": 14.65, "currency": "USD", "unit": "bushel" },
      { "date": "2023-05-01", "price": 14.32, "currency": "USD", "unit": "bushel" },
      { "date": "2023-06-01", "price": 14.78, "currency": "USD", "unit": "bushel" },
      { "date": "2023-07-01", "price": 15.12, "currency": "USD", "unit": "bushel" },
      { "date": "2023-08-01", "price": 15.34, "currency": "USD", "unit": "bushel" },
      { "date": "2023-09-01", "price": 15.21, "currency": "USD", "unit": "bushel" },
      { "date": "2023-10-01", "price": 15.45, "currency": "USD", "unit": "bushel" }
    ],
    "020130": [
      { "date": "2023-01-01", "price": 4.87, "currency": "USD", "unit": "lb" },
      { "date": "2023-02-01", "price": 4.92, "currency": "USD", "unit": "lb" },
      { "date": "2023-03-01", "price": 5.01, "currency": "USD", "unit": "lb" },
      { "date": "2023-04-01", "price": 5.12, "currency": "USD", "unit": "lb" },
      { "date": "2023-05-01", "price": 5.23, "currency": "USD", "unit": "lb" },
      { "date": "2023-06-01", "price": 5.18, "currency": "USD", "unit": "lb" },
      { "date": "2023-07-01", "price": 5.25, "currency": "USD", "unit": "lb" },
      { "date": "2023-08-01", "price": 5.32, "currency": "USD", "unit": "lb" },
      { "date": "2023-09-01", "price": 5.28, "currency": "USD", "unit": "lb" },
      { "date": "2023-10-01", "price": 5.35, "currency": "USD", "unit": "lb" }
    ]
  },
  tariffs: {
    "120190": {
      "rate": 0.0,
      "unit": "%",
      "effectiveDate": "2022-01-01T00:00:00Z",
      "expirationDate": null,
      "country": "US",
      "notes": "Zero duty rate for soybeans under most trade agreements",
      "specialPrograms": [
        { "code": "GSP", "name": "Generalized System of Preferences", "rate": 0.0 }
      ],
      "quotas": null,
      "lastUpdated": "2023-01-15"
    },
    "020130": {
      "rate": 4.4,
      "unit": "%",
      "effectiveDate": "2022-01-01T00:00:00Z",
      "expirationDate": null,
      "country": "US",
      "notes": "Beef tariffs vary significantly by country of origin and trade agreements",
      "specialPrograms": [
        { "code": "USMCA", "name": "US-Mexico-Canada Agreement", "rate": 0.0 },
        { "code": "GSP", "name": "Generalized System of Preferences", "rate": 0.0 }
      ],
      "quotas": {
        "annual": 65000,
        "unit": "metric tons",
        "filled": 34500,
        "remainingPct": 47
      },
      "lastUpdated": "2023-02-10"
    }
  },
  risks: [
    {
      "_id": "60a1c1b3d8b1c3a4b5a6c7e0",
      "title": "Brazil Crop Disease Warning",
      "description": "Soybean rust outbreak in key growing regions of Brazil may affect upcoming harvest",
      "type": "supply",
      "severity": 3,
      "isActive": true,
      "affectedHsCodes": ["120190"],
      "affectedRegions": ["Brazil", "South America"],
      "startDate": "2023-06-15T00:00:00Z",
      "endDate": null,
      "recommendations": "Consider diversifying suppliers and increasing inventory",
      "sourceUrl": "https://www.example.com/brazil-crop-disease",
      "createdAt": "2023-06-15T09:30:00Z",
      "updatedAt": "2023-06-15T09:30:00Z"
    },
    {
      "_id": "60a1c1b3d8b1c3a4b5a6c7e1",
      "title": "Port Strikes in Argentina",
      "description": "Dock workers strike at major Argentinian ports affecting agricultural exports",
      "type": "logistics",
      "severity": 4,
      "isActive": true,
      "affectedHsCodes": ["120190", "020130", "100199"],
      "affectedRegions": ["Argentina", "South America"],
      "startDate": "2023-07-01T00:00:00Z",
      "endDate": "2023-07-15T00:00:00Z",
      "recommendations": "Allow extra transit time; consider air freight for urgent shipments",
      "sourceUrl": "https://www.example.com/argentina-port-strikes",
      "createdAt": "2023-07-01T14:15:00Z",
      "updatedAt": "2023-07-01T14:15:00Z"
    }
  ],
  forecasts: {
    "120190": {
      "1m": {
        "hsCode": "120190",
        "date": "2023-11-01T00:00:00Z",
        "predictedPrice": 15.78,
        "confidenceInterval": { "lower": 15.23, "upper": 16.33 },
        "confidenceScore": 85,
        "factors": [
          {
            "name": "Weather conditions",
            "impact": 0.6,
            "description": "Favorable weather in major growing regions"
          },
          {
            "name": "Chinese demand",
            "impact": 0.8,
            "description": "Increased imports from China expected"
          }
        ],
        "modelVersion": "v2.1",
        "currency": "USD",
        "unit": "bushel",
        "horizon": "1m",
        "createdAt": "2023-10-01T12:00:00Z"
      }
    }
  }
};

// Helper function to handle response with delay (simulate network latency)
const respondWithDelay = (res, data, delay = 100) => {
  setTimeout(() => {
    res.status(200).json(data);
  }, delay);
};

// Create middleware for each API endpoint
const createMockMiddleware = (controller) => {
  switch (controller) {
    case 'hsCode':
      return {
        getAllHsCodes: (req, res, next) => {
          // Apply pagination
          const page = parseInt(req.query.page, 10) || 1;
          const limit = parseInt(req.query.limit, 10) || 10;
          const skip = (page - 1) * limit;
          
          // Apply filters
          let filteredCodes = [...mockData.hsCodes];
          
          if (req.query.search) {
            const searchLower = req.query.search.toLowerCase();
            filteredCodes = filteredCodes.filter(
              hs => hs.code.includes(searchLower) || 
                    hs.description.toLowerCase().includes(searchLower)
            );
          }
          
          if (req.query.section) {
            filteredCodes = filteredCodes.filter(
              hs => hs.section === req.query.section
            );
          }
          
          if (req.query.chapter) {
            filteredCodes = filteredCodes.filter(
              hs => hs.chapter === req.query.chapter
            );
          }
          
          // Apply pagination
          const totalDocs = filteredCodes.length;
          const paginatedCodes = filteredCodes.slice(skip, skip + limit);
          
          respondWithDelay(res, {
            status: 'success',
            results: paginatedCodes.length,
            pagination: {
              page,
              limit,
              totalPages: Math.ceil(totalDocs / limit),
              totalResults: totalDocs
            },
            data: {
              hsCodes: paginatedCodes
            }
          });
        },
        
        getHsCode: (req, res, next) => {
          const { code } = req.params;
          const hsCode = mockData.hsCodes.find(hs => hs.code === code);
          
          if (!hsCode) {
            return res.status(404).json({
              status: 'fail',
              message: 'HS code not found'
            });
          }
          
          respondWithDelay(res, {
            status: 'success',
            data: {
              hsCode
            }
          });
        },
        
        getSavedHsCodes: (req, res, next) => {
          const userId = req.user._id;
          const user = mockData.users.find(u => u._id === userId) || mockData.users[0];
          const savedCodes = user.savedHsCodes;
          const hsCodes = mockData.hsCodes.filter(hs => savedCodes.includes(hs.code));
          
          respondWithDelay(res, {
            status: 'success',
            results: hsCodes.length,
            data: {
              hsCodes
            }
          });
        },
        
        saveHsCode: (req, res, next) => {
          const { code } = req.params;
          const userId = req.user._id;
          const user = mockData.users.find(u => u._id === userId) || mockData.users[0];
          
          if (!user.savedHsCodes.includes(code)) {
            user.savedHsCodes.push(code);
          }
          
          respondWithDelay(res, {
            status: 'success',
            message: 'HS code saved to your list',
            data: {
              savedHsCodes: user.savedHsCodes
            }
          });
        },
        
        unsaveHsCode: (req, res, next) => {
          const { code } = req.params;
          const userId = req.user._id;
          const user = mockData.users.find(u => u._id === userId) || mockData.users[0];
          
          user.savedHsCodes = user.savedHsCodes.filter(c => c !== code);
          
          respondWithDelay(res, {
            status: 'success',
            message: 'HS code removed from your list',
            data: {
              savedHsCodes: user.savedHsCodes
            }
          });
        }
      };
      
    case 'price':
      return {
        getPriceHistory: (req, res, next) => {
          const { code } = req.params;
          const prices = mockData.prices[code];
          
          if (!prices) {
            return res.status(404).json({
              status: 'fail',
              message: 'No price data found for this HS code'
            });
          }
          
          let filteredPrices = [...prices];
          
          // Apply date filters
          if (req.query.startDate) {
            const startDate = new Date(req.query.startDate);
            filteredPrices = filteredPrices.filter(p => new Date(p.date) >= startDate);
          }
          
          if (req.query.endDate) {
            const endDate = new Date(req.query.endDate);
            filteredPrices = filteredPrices.filter(p => new Date(p.date) <= endDate);
          }
          
          // Format for Chart.js if requested
          if (req.query.format === 'chart') {
            const chartData = {
              labels: filteredPrices.map(p => new Date(p.date).toLocaleDateString()),
              datasets: [{
                label: `Price (${filteredPrices[0]?.currency || 'USD'}/${filteredPrices[0]?.unit || 'unit'})`,
                data: filteredPrices.map(p => p.price),
                borderColor: '#3e95cd',
                fill: false
              }]
            };
            
            respondWithDelay(res, {
              status: 'success',
              timeRange: {
                start: req.query.startDate || filteredPrices[0]?.date,
                end: req.query.endDate || filteredPrices[filteredPrices.length - 1]?.date
              },
              data: chartData
            });
          } else {
            respondWithDelay(res, {
              status: 'success',
              timeRange: {
                start: req.query.startDate || filteredPrices[0]?.date,
                end: req.query.endDate || filteredPrices[filteredPrices.length - 1]?.date
              },
              data: filteredPrices
            });
          }
        },
        
        getCurrentPrice: (req, res, next) => {
          const { code } = req.params;
          const prices = mockData.prices[code];
          
          if (!prices || prices.length === 0) {
            return res.status(404).json({
              status: 'fail',
              message: 'No price data found for this HS code'
            });
          }
          
          const latestPrice = prices[prices.length - 1];
          
          respondWithDelay(res, {
            status: 'success',
            data: {
              price: latestPrice
            }
          });
        }
      };
      
    case 'tariff':
      return {
        getCurrentTariff: (req, res, next) => {
          const { code } = req.params;
          const tariff = mockData.tariffs[code];
          
          if (!tariff) {
            return res.status(404).json({
              status: 'fail',
              message: 'No tariff data found for this HS code'
            });
          }
          
          const hsCode = mockData.hsCodes.find(hs => hs.code === code);
          
          respondWithDelay(res, {
            status: 'success',
            data: {
              tariff,
              hsCodeDescription: hsCode?.description || 'Unknown'
            }
          });
        }
      };
      
    case 'risk':
      return {
        getAllRisks: (req, res, next) => {
          let filteredRisks = [...mockData.risks];
          
          // Apply filters
          if (req.query.active === 'true') {
            filteredRisks = filteredRisks.filter(risk => risk.isActive);
          } else if (req.query.active === 'false') {
            filteredRisks = filteredRisks.filter(risk => !risk.isActive);
          }
          
          if (req.query.type) {
            filteredRisks = filteredRisks.filter(risk => risk.type === req.query.type);
          }
          
          if (req.query.minSeverity) {
            filteredRisks = filteredRisks.filter(risk => risk.severity >= parseInt(req.query.minSeverity, 10));
          }
          
          // Apply pagination
          const page = parseInt(req.query.page, 10) || 1;
          const limit = parseInt(req.query.limit, 10) || 20;
          const skip = (page - 1) * limit;
          const paginatedRisks = filteredRisks.slice(skip, skip + limit);
          
          respondWithDelay(res, {
            status: 'success',
            results: paginatedRisks.length,
            pagination: {
              page,
              limit,
              totalPages: Math.ceil(filteredRisks.length / limit),
              totalResults: filteredRisks.length
            },
            data: {
              risks: paginatedRisks
            }
          });
        },
        
        getRisksByHsCode: (req, res, next) => {
          const { code } = req.params;
          const risks = mockData.risks.filter(risk => 
            risk.affectedHsCodes.includes(code) && risk.isActive
          );
          
          respondWithDelay(res, {
            status: 'success',
            results: risks.length,
            data: {
              risks
            }
          });
        }
      };
      
    case 'forecast':
      return {
        getForecast: (req, res, next) => {
          const { code } = req.params;
          const horizonParam = req.query.horizon || '1m';
          
          // Try to get forecast from mock data
          const forecasts = mockData.forecasts[code];
          if (forecasts && forecasts[horizonParam]) {
            const forecast = forecasts[horizonParam];
            const hsCode = mockData.hsCodes.find(hs => hs.code === code);
            
            respondWithDelay(res, {
              status: 'success',
              data: {
                forecast,
                productInfo: {
                  code,
                  description: hsCode?.description || 'Unknown'
                }
              }
            });
          } else {
            return res.status(404).json({
              status: 'fail',
              message: 'No forecast data found for this HS code'
            });
          }
        }
      };
      
    default:
      return {};
  }
};

// Main middleware function that will use mockData when database fails
const mockDataMiddleware = (route) => {
  const controllerMap = {
    '/api/hscode': 'hsCode',
    '/api/prices': 'price',
    '/api/tariffs': 'tariff',
    '/api/risks': 'risk',
    '/api/forecasts': 'forecast'
  };
  
  // Get the controller type based on the route
  const controllerType = Object.keys(controllerMap).find(key => route.startsWith(key));
  const controller = controllerType ? controllerMap[controllerType] : null;
  
  if (!controller) {
    return (req, res, next) => next();
  }
  
  const mockController = createMockMiddleware(controller);
  
  // Return middleware that handles the route
  return (req, res, next) => {
    const path = req.path;
    
    // For HsCode controller
    if (controller === 'hsCode') {
      if (req.method === 'GET' && path === '/' || path === '') {
        return mockController.getAllHsCodes(req, res, next);
      } else if (req.method === 'GET' && path === '/saved/list') {
        return mockController.getSavedHsCodes(req, res, next);
      } else if (req.method === 'GET' && path.match(/^\/\d+$/)) {
        req.params.code = path.substring(1);
        return mockController.getHsCode(req, res, next);
      } else if (req.method === 'POST' && path.match(/^\/\d+\/save$/)) {
        req.params.code = path.match(/^\/(\d+)\/save$/)[1];
        return mockController.saveHsCode(req, res, next);
      } else if (req.method === 'DELETE' && path.match(/^\/\d+\/unsave$/)) {
        req.params.code = path.match(/^\/(\d+)\/unsave$/)[1];
        return mockController.unsaveHsCode(req, res, next);
      }
    }
    
    // For Price controller
    else if (controller === 'price') {
      if (req.method === 'GET' && path.match(/^\/\d+\/history$/)) {
        req.params.code = path.match(/^\/(\d+)\/history$/)[1];
        return mockController.getPriceHistory(req, res, next);
      } else if (req.method === 'GET' && path.match(/^\/\d+\/current$/)) {
        req.params.code = path.match(/^\/(\d+)\/current$/)[1];
        return mockController.getCurrentPrice(req, res, next);
      }
    }
    
    // For Tariff controller
    else if (controller === 'tariff') {
      if (req.method === 'GET' && path.match(/^\/\d+\/current$/)) {
        req.params.code = path.match(/^\/(\d+)\/current$/)[1];
        return mockController.getCurrentTariff(req, res, next);
      }
    }
    
    // For Risk controller
    else if (controller === 'risk') {
      if (req.method === 'GET' && (path === '/' || path === '')) {
        return mockController.getAllRisks(req, res, next);
      } else if (req.method === 'GET' && path.match(/^\/hscode\/\d+$/)) {
        req.params.code = path.match(/^\/hscode\/(\d+)$/)[1];
        return mockController.getRisksByHsCode(req, res, next);
      }
    }
    
    // For Forecast controller
    else if (controller === 'forecast') {
      if (req.method === 'GET' && path.match(/^\/\d+$/)) {
        req.params.code = path.match(/^\/(\d+)$/)[1];
        return mockController.getForecast(req, res, next);
      }
    }
    
    // If no handler found, continue to next middleware
    next();
  };
};

module.exports = mockDataMiddleware;