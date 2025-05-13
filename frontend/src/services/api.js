import axios from 'axios';
import mockData from './mockData';

// Set base URL - explicitly use the backend URL
const API_URL = 'http://localhost:5000';

// Set to false to use real API data
let USE_MOCK_DATA = false;

// Check if we're supposed to use mock data fallback (set by response interceptor if backend is unavailable)
if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('USE_MOCK_DATA_FALLBACK') === 'true') {
  console.log('Backend was previously unavailable - using mock data fallback');
  USE_MOCK_DATA = true;
}

// Log data source being used
console.log(`Using ${USE_MOCK_DATA ? 'mock' : 'real API'} data with direct backend URL:`, API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  // Don't throw on non-2xx status codes
  validateStatus: status => status >= 200 && status < 500
});

// Intercept requests to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses for common error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is due to network connectivity (backend not running)
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
      console.warn('Backend connection error, will try to use mock data if available');
      
      // Set a flag in sessionStorage to indicate backend is not available
      // This allows us to switch to mock data for subsequent requests
      sessionStorage.setItem('USE_MOCK_DATA_FALLBACK', 'true');
      
      // Show user a notification that we're using mock data
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('backendUnavailable', { 
          detail: { message: 'Backend server is unavailable. Using mock data instead.' } 
        }));
      }
    }
    
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle other errors
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      'An unknown error occurred';
    
    return Promise.reject(errorMessage);
  }
);

// HS Code API
export const hsCodeAPI = {
  search: (params) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          let filteredCodes = [...mockData.hsCodes];
          
          // Apply search filter
          if (params?.search) {
            const searchLower = params.search.toLowerCase();
            filteredCodes = filteredCodes.filter(
              hs => hs.code.includes(searchLower) || 
                   hs.description.toLowerCase().includes(searchLower)
            );
          }
          
          // Apply section filter
          if (params?.section) {
            filteredCodes = filteredCodes.filter(
              hs => hs.section === params.section
            );
          }
          
          // Apply chapter filter
          if (params?.chapter) {
            filteredCodes = filteredCodes.filter(
              hs => hs.chapter === params.chapter
            );
          }
          
          // Apply pagination
          const page = params?.page || 1;
          const limit = params?.limit || 10;
          const start = (page - 1) * limit;
          const end = start + limit;
          const paginatedCodes = filteredCodes.slice(start, end);
          
          resolve({
            data: {
              status: 'success',
              pagination: {
                page,
                limit,
                totalPages: Math.ceil(filteredCodes.length / limit),
                totalResults: filteredCodes.length
              },
              data: {
                hsCodes: paginatedCodes
              }
            }
          });
        }, 500); // Simulate network delay
      });
    } else {
      // Try different route variants with a retry strategy
      // This ensures compatibility with various server route configurations
      return new Promise((resolve, reject) => {
        console.log('Attempting HS code search with advanced retry strategy');
        
        // First try the default route
        api.get('/api/hscode', { params })
          .then(resolve)
          .catch(error => {
            console.warn('Error with /api/hscode route, trying alternate route: /api/hsCode');
            
            // Try camelCase version if the lowercase version fails
            api.get('/api/hsCode', { params })
              .then(resolve)
              .catch(error2 => {
                console.warn('Error with /api/hsCode route, trying kebab-case route: /api/hs-code');
                
                // Try kebab-case version if the camelCase version fails
                api.get('/api/hs-code', { params })
                  .then(resolve)
                  .catch(error3 => {
                    console.error('All HS code route variants failed');
                    reject('Failed to search HS codes. Please try again.');
                  });
              });
          });
      });
    }
  },
  
  getByCode: (code) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const hsCode = mockData.hsCodes.find(hs => hs.code === code);
          
          if (hsCode) {
            resolve({
              data: {
                status: 'success',
                data: {
                  hsCode
                }
              }
            });
          } else {
            reject('HS Code not found');
          }
        }, 300);
      });
    } else {
      return api.get(`/api/hscode/${code}`);
    }
  },
  
  getSaved: () => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const savedCodes = ['120190', '020130', '843149'];
          const hsCodes = mockData.hsCodes.filter(hs => savedCodes.includes(hs.code));
          
          resolve({
            data: {
              status: 'success',
              data: {
                hsCodes
              }
            }
          });
        }, 300);
      });
    } else {
      return api.get('/api/hscode/saved/list');
    }
  },
  
  save: (code) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              status: 'success',
              message: 'HS code saved to your list',
              data: {
                savedHsCodes: ['120190', '020130', '843149', code]
              }
            }
          });
        }, 200);
      });
    } else {
      return api.post(`/api/hscode/${code}/save`);
    }
  },
  
  unsave: (code) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              status: 'success',
              message: 'HS code removed from your list',
              data: {
                savedHsCodes: ['120190', '020130', '843149'].filter(c => c !== code)
              }
            }
          });
        }, 200);
      });
    } else {
      return api.delete(`/api/hscode/${code}/unsave`);
    }
  }
};

// Price API
export const priceAPI = {
  getHistory: (code, params) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const prices = mockData.priceHistory[code] || [];
          
          // Filter by date range if provided
          let filteredPrices = [...prices];
          if (params?.startDate) {
            const startDate = new Date(params.startDate);
            filteredPrices = filteredPrices.filter(p => new Date(p.date) >= startDate);
          }
          if (params?.endDate) {
            const endDate = new Date(params.endDate);
            filteredPrices = filteredPrices.filter(p => new Date(p.date) <= endDate);
          }
          
          // Format for Chart.js if requested
          if (params?.format === 'chart') {
            const chartData = {
              labels: filteredPrices.map(p => new Date(p.date).toLocaleDateString()),
              datasets: [{
                label: `Price (${params?.currency || 'USD'}/${filteredPrices[0]?.unit || 'unit'})`,
                data: filteredPrices.map(p => p.price),
                borderColor: '#3e95cd',
                fill: false
              }]
            };
            
            resolve({
              data: {
                status: 'success',
                timeRange: {
                  start: params?.startDate || filteredPrices[0]?.date,
                  end: params?.endDate || filteredPrices[filteredPrices.length - 1]?.date
                },
                data: chartData
              }
            });
          } else {
            resolve({
              data: {
                status: 'success',
                timeRange: {
                  start: params?.startDate || filteredPrices[0]?.date,
                  end: params?.endDate || filteredPrices[filteredPrices.length - 1]?.date
                },
                data: filteredPrices
              }
            });
          }
        }, 500);
      });
    } else {
      // Try API call, with explicit error handling to use fallback automatically
      return new Promise(async (resolve, reject) => {
        try {
          const response = await api.get(`/api/prices/${code}/history`, { params });
          
          if (response.status === 200) {
            // Add metadata about data source for UI display
            if (response.data && Array.isArray(response.data.data)) {
              const priceData = response.data.data;
              if (priceData.length > 0) {
                // Check if data source is already in the response
                const hasSourceInfo = 'source' in priceData[0];
                
                if (!hasSourceInfo) {
                  // Add source info if it's not already present
                  response.data.sourceInfo = {
                    source: 'API',
                    dataQuality: 'Production',
                    lastUpdated: new Date().toISOString()
                  };
                } else {
                  // Extract source info from the first data point
                  response.data.sourceInfo = {
                    source: priceData[0].source || 'API',
                    notes: priceData[0].notes,
                    dataQuality: priceData[0].source === 'Quandl' ? 'Production' : 'Development',
                    lastUpdated: new Date().toISOString()
                  };
                }
              }
            }
            resolve(response);
          } else {
            reject(`API Error: ${response.status}`);
          }
        } catch (error) {
          console.warn('Error fetching price history:', error);
          // Use mock data as fallback
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('USE_MOCK_DATA_FALLBACK', 'true');
          }
          // Recursive call with mock data
          USE_MOCK_DATA = true;
          resolve(priceAPI.getHistory(code, params));
        }
      });
    }
  },
  
  getCurrent: (code) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const prices = mockData.priceHistory[code];
          
          if (prices && prices.length > 0) {
            // Get the most recent price
            const latestPrice = prices[prices.length - 1];
            
            resolve({
              data: {
                status: 'success',
                data: {
                  price: latestPrice
                }
              }
            });
          } else {
            reject('No price data available for this HS code');
          }
        }, 300);
      });
    } else {
      // Try API call, with explicit error handling to use fallback automatically
      return new Promise(async (resolve, reject) => {
        try {
          const response = await api.get(`/api/prices/${code}/current`);
          
          if (response.status === 200) {
            // Add metadata about data source for UI display
            if (response.data?.data?.price) {
              const price = response.data.data.price;
              
              // Check if data source is already in the response
              if (!price.source) {
                // Add source info if it's not already present
                response.data.sourceInfo = {
                  source: 'API',
                  dataQuality: 'Production',
                  lastUpdated: new Date().toISOString()
                };
              } else {
                // Extract source info
                response.data.sourceInfo = {
                  source: price.source,
                  notes: price.notes,
                  dataQuality: price.source === 'Quandl' ? 'Production' : 'Development',
                  lastUpdated: price.date
                };
              }
              
              // Add volume data if it exists
              if (price.volume) {
                response.data.data.volume = price.volume;
              }
            }
            
            resolve(response);
          } else {
            reject(`API Error: ${response.status}`);
          }
        } catch (error) {
          console.warn('Error fetching current price:', error);
          // Use mock data as fallback
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('USE_MOCK_DATA_FALLBACK', 'true');
          }
          // Recursive call with mock data
          USE_MOCK_DATA = true;
          resolve(priceAPI.getCurrent(code));
        }
      });
    }
  },
  
  compare: (codes, params) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const results = {};
          
          codes.forEach(code => {
            const prices = mockData.priceHistory[code];
            
            if (prices && prices.length > 0) {
              // Filter by date range if provided
              let filteredPrices = [...prices];
              if (params?.startDate) {
                const startDate = new Date(params.startDate);
                filteredPrices = filteredPrices.filter(p => new Date(p.date) >= startDate);
              }
              if (params?.endDate) {
                const endDate = new Date(params.endDate);
                filteredPrices = filteredPrices.filter(p => new Date(p.date) <= endDate);
              }
              
              const hsCode = mockData.hsCodes.find(hs => hs.code === code);
              
              results[code] = {
                description: hsCode?.description || 'Unknown Commodity',
                prices: filteredPrices
              };
            } else {
              results[code] = { error: 'No price data available' };
            }
          });
          
          resolve({
            data: {
              status: 'success',
              timeRange: {
                start: params?.startDate,
                end: params?.endDate
              },
              data: results
            }
          });
        }, 700);
      });
    } else {
      // Try API call, with explicit error handling to use fallback automatically
      return new Promise(async (resolve, reject) => {
        try {
          const response = await api.post('/api/prices/compare', { codes }, { params });
          
          if (response.status === 200) {
            // Add metadata about data sources for UI display
            if (response.data?.data) {
              const results = response.data.data;
              
              // Gather source info from all results
              const sources = new Set();
              let hasVolume = false;
              
              // Process each HS code's data
              Object.keys(results).forEach(code => {
                if (results[code].prices && results[code].prices.length > 0) {
                  // Check for source and volume info
                  results[code].prices.forEach(price => {
                    if (price.source) {
                      sources.add(price.source);
                    }
                    if (price.volume) {
                      hasVolume = true;
                    }
                  });
                }
              });
              
              // Add source metadata
              response.data.sourceInfo = {
                sources: Array.from(sources),
                dataQuality: sources.has('Quandl') ? 'Production' : 'Development',
                hasVolume: hasVolume,
                lastUpdated: new Date().toISOString()
              };
            }
            
            resolve(response);
          } else {
            reject(`API Error: ${response.status}`);
          }
        } catch (error) {
          console.warn('Error comparing prices:', error);
          // Use mock data as fallback
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('USE_MOCK_DATA_FALLBACK', 'true');
          }
          // Recursive call with mock data
          USE_MOCK_DATA = true;
          resolve(priceAPI.compare(codes, params));
        }
      });
    }
  }
};

// Tariff API
export const tariffAPI = {
  getCurrent: (code, params) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const tariff = mockData.tariffs[code];
          
          if (tariff) {
            const hsCode = mockData.hsCodes.find(hs => hs.code === code);
            
            resolve({
              data: {
                status: 'success',
                data: {
                  tariff,
                  hsCodeDescription: hsCode?.description || 'Unknown'
                }
              }
            });
          } else {
            reject('No tariff data available for this HS code');
          }
        }, 300);
      });
    } else {
      return api.get(`/api/tariffs/${code}/current`, { params });
    }
  },
  
  getHistory: (code, params) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const tariff = mockData.tariffs[code];
          const hsCode = mockData.hsCodes.find(hs => hs.code === code);
          
          // Create a history by slightly modifying the current tariff
          const history = [];
          if (tariff) {
            // Current tariff
            history.push({...tariff});
            
            // Previous tariff (1 year ago)
            history.push({
              ...tariff,
              rate: tariff.rate * 1.1, // 10% higher rate in the past
              effectiveDate: new Date(new Date(tariff.effectiveDate).getTime() - 365 * 24 * 60 * 60 * 1000).toISOString(),
              expirationDate: tariff.effectiveDate
            });
            
            // Older tariff (2 years ago)
            history.push({
              ...tariff,
              rate: tariff.rate * 1.2, // 20% higher rate in the further past
              effectiveDate: new Date(new Date(tariff.effectiveDate).getTime() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
              expirationDate: new Date(new Date(tariff.effectiveDate).getTime() - 365 * 24 * 60 * 60 * 1000).toISOString()
            });
          }
          
          resolve({
            data: {
              status: 'success',
              results: history.length,
              data: {
                tariffs: history,
                hsCodeDescription: hsCode?.description || 'Unknown'
              }
            }
          });
        }, 400);
      });
    } else {
      return api.get(`/api/tariffs/${code}/history`, { params });
    }
  },
  
  calculate: (data) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const { hsCode, importValue, country, specialProgram, quantity, quantityUnit, shippingMode } = data;
          
          const tariff = mockData.tariffs[hsCode];
          const hsCodeData = mockData.hsCodes.find(hs => hs.code === hsCode);
          
          if (!tariff || !hsCodeData) {
            reject('HS code or tariff information not found');
            return;
          }
          
          // Get duty rate (use special program if specified)
          let dutyRate = tariff.rate;
          let dutyDescription = 'General duty rate';
          
          if (specialProgram && tariff.specialPrograms) {
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
            dutyAmount = (importValue * dutyRate) / 100; // Default to ad valorem
          }
          
          // Calculate additional duties (none in our mock data)
          const additionalDuties = [];
          const additionalDutiesTotal = 0;
          
          // Calculate fees (US specific)
          let mpf = 0;
          let hmf = 0;
          
          if (country === 'US') {
            // Merchandise Processing Fee
            const mpfRate = 0.3464; // %
            const mpfMin = 27.75;
            const mpfMax = 538.40;
            
            mpf = (importValue * mpfRate) / 100;
            if (mpf < mpfMin) mpf = mpfMin;
            if (mpf > mpfMax) mpf = mpfMax;
            
            // Harbor Maintenance Fee (only for ocean shipments)
            if (shippingMode === 'ocean') {
              const hmfRate = 0.125; // %
              hmf = (importValue * hmfRate) / 100;
            }
          }
          
          // Calculate totals
          const totalDuties = dutyAmount + additionalDutiesTotal;
          const totalFees = mpf + hmf;
          const totalLandedCost = importValue + totalDuties + totalFees;
          
          resolve({
            data: {
              status: 'success',
              data: {
                hsCode,
                description: hsCodeData.description,
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
            }
          });
        }, 600);
      });
    } else {
      return api.post('/api/tariffs/calculate', data);
    }
  }
};

// Risk API
export const riskAPI = {
  getAll: (params) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          let filteredRisks = [...mockData.risks];
          
          // Filter by active status
          if (params?.active === 'true') {
            filteredRisks = filteredRisks.filter(risk => risk.isActive);
          } else if (params?.active === 'false') {
            filteredRisks = filteredRisks.filter(risk => !risk.isActive);
          }
          
          // Filter by type
          if (params?.type) {
            filteredRisks = filteredRisks.filter(risk => risk.type === params.type);
          }
          
          // Filter by minimum severity
          if (params?.minSeverity) {
            filteredRisks = filteredRisks.filter(risk => risk.severity >= parseInt(params.minSeverity, 10));
          }
          
          // Apply pagination
          const page = parseInt(params?.page, 10) || 1;
          const limit = parseInt(params?.limit, 10) || 20;
          const skip = (page - 1) * limit;
          const paginatedRisks = filteredRisks.slice(skip, skip + limit);
          
          resolve({
            data: {
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
            }
          });
        }, 400);
      });
    } else {
      return api.get('/api/risks', { params });
    }
  },
  
  getByHsCode: (code) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const risks = mockData.risks.filter(risk => 
            risk.affectedHsCodes.includes(code) && risk.isActive
          );
          
          resolve({
            data: {
              status: 'success',
              results: risks.length,
              data: {
                risks
              }
            }
          });
        }, 300);
      });
    } else {
      return api.get(`/api/risks/hscode/${code}`);
    }
  },
  
  getByRegion: (region) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const regionLower = region.toLowerCase();
          const risks = mockData.risks.filter(risk => 
            risk.affectedRegions.some(r => r.toLowerCase().includes(regionLower)) && 
            risk.isActive
          );
          
          resolve({
            data: {
              status: 'success',
              results: risks.length,
              data: {
                risks
              }
            }
          });
        }, 300);
      });
    } else {
      return api.get(`/api/risks/region/${region}`);
    }
  }
};

// Forecast API
export const forecastAPI = {
  get: (code, params) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const horizonParam = params?.horizon || '1m';
          
          // Try to get forecast from mock data
          const forecasts = mockData.forecasts[code];
          if (forecasts && forecasts[horizonParam]) {
            const forecast = forecasts[horizonParam];
            const hsCode = mockData.hsCodes.find(hs => hs.code === code);
            
            resolve({
              data: {
                status: 'success',
                data: {
                  forecast,
                  productInfo: {
                    code,
                    description: hsCode?.description || 'Unknown'
                  }
                }
              }
            });
          } else if (forecasts) {
            // If we have forecasts for this HS code but not for the requested horizon
            // Use the '1m' forecast as fallback
            const fallbackForecast = forecasts['1m'];
            const hsCode = mockData.hsCodes.find(hs => hs.code === code);
            
            if (fallbackForecast) {
              // Modify the fallback forecast to match the requested horizon
              const modifiedForecast = {
                ...fallbackForecast,
                horizon: horizonParam,
                date: new Date(Date.now() + getHorizonDays(horizonParam) * 24 * 60 * 60 * 1000).toISOString(),
                confidenceScore: Math.max(30, fallbackForecast.confidenceScore - (horizonParam === '3m' ? 10 : horizonParam === '6m' ? 20 : horizonParam === '1y' ? 30 : 0))
              };
              
              resolve({
                data: {
                  status: 'success',
                  data: {
                    forecast: modifiedForecast,
                    productInfo: {
                      code,
                      description: hsCode?.description || 'Unknown'
                    }
                  }
                }
              });
            } else {
              reject('Forecast data not available for this horizon');
            }
          } else {
            // Generate a simple forecast for this HS code
            const hsCode = mockData.hsCodes.find(hs => hs.code === code);
            if (!hsCode) {
              reject('HS code not found');
              return;
            }
            
            // Get prices to base forecast on
            const prices = mockData.priceHistory[code];
            if (!prices || prices.length === 0) {
              reject('No price data available for this HS code');
              return;
            }
            
            const latestPrice = prices[prices.length - 1];
            const randomChange = (Math.random() * 0.2) - 0.1; // -10% to +10%
            const predictedPrice = latestPrice.price * (1 + randomChange);
            
            const generatedForecast = {
              hsCode: code,
              date: new Date(Date.now() + getHorizonDays(horizonParam) * 24 * 60 * 60 * 1000).toISOString(),
              predictedPrice,
              confidenceInterval: {
                lower: predictedPrice * 0.9,
                upper: predictedPrice * 1.1
              },
              confidenceScore: 70,
              factors: [
                {
                  name: "Market trends",
                  impact: randomChange > 0 ? 0.5 : -0.5,
                  description: randomChange > 0 ? "Increasing demand" : "Decreasing demand"
                }
              ],
              modelVersion: "v1.0-demo",
              currency: latestPrice.currency,
              unit: latestPrice.unit,
              horizon: horizonParam,
              createdAt: new Date().toISOString()
            };
            
            resolve({
              data: {
                status: 'success',
                data: {
                  forecast: generatedForecast,
                  productInfo: {
                    code,
                    description: hsCode.description
                  }
                }
              }
            });
          }
        }, 600);
      });
    } else {
      return api.get(`/api/forecasts/${code}`, { params });
    }
  },
  
  getMultiHorizon: (code, params) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const horizons = params?.horizons ? params.horizons.split(',') : ['1m', '3m', '6m', '1y'];
          const forecasts = mockData.forecasts[code];
          const hsCode = mockData.hsCodes.find(hs => hs.code === code);
          
          if (!hsCode) {
            reject('HS code not found');
            return;
          }
          
          // If we have pregenerated forecasts, use them
          if (forecasts) {
            resolve({
              data: {
                status: 'success',
                data: {
                  forecasts,
                  productInfo: {
                    code,
                    description: hsCode.description
                  }
                }
              }
            });
            return;
          }
          
          // Otherwise generate forecasts for each horizon
          const prices = mockData.priceHistory[code];
          if (!prices || prices.length === 0) {
            reject('No price data available for this HS code');
            return;
          }
          
          const latestPrice = prices[prices.length - 1];
          const generatedForecasts = {};
          
          horizons.forEach(horizon => {
            const randomChange = (Math.random() * 0.3) - 0.15; // -15% to +15%
            const confidenceReduction = horizon === '3m' ? 10 : horizon === '6m' ? 20 : horizon === '1y' ? 30 : 0;
            
            generatedForecasts[horizon] = {
              hsCode: code,
              date: new Date(Date.now() + getHorizonDays(horizon) * 24 * 60 * 60 * 1000).toISOString(),
              predictedPrice: latestPrice.price * (1 + randomChange),
              confidenceInterval: {
                lower: latestPrice.price * (1 + randomChange - 0.1),
                upper: latestPrice.price * (1 + randomChange + 0.1)
              },
              confidenceScore: Math.max(30, 70 - confidenceReduction),
              factors: [
                {
                  name: "Market trends",
                  impact: randomChange > 0 ? 0.5 : -0.5,
                  description: randomChange > 0 ? "Increasing demand" : "Decreasing demand"
                }
              ],
              modelVersion: "v1.0-demo",
              currency: latestPrice.currency,
              unit: latestPrice.unit,
              horizon,
              createdAt: new Date().toISOString()
            };
          });
          
          resolve({
            data: {
              status: 'success',
              data: {
                forecasts: generatedForecasts,
                productInfo: {
                  code,
                  description: hsCode.description
                }
              }
            }
          });
        }, 800);
      });
    } else {
      return api.get(`/api/forecasts/${code}/multi-horizon`, { params });
    }
  },
  
  compare: (codes, params) => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const horizon = params?.horizon || '1m';
          const results = {};
          
          codes.forEach(code => {
            const hsCode = mockData.hsCodes.find(hs => hs.code === code);
            if (!hsCode) {
              results[code] = { error: 'HS code not found' };
              return;
            }
            
            // Check if we have pregenerated forecasts
            const forecasts = mockData.forecasts[code];
            if (forecasts && forecasts[horizon]) {
              results[code] = {
                description: hsCode.description,
                forecast: forecasts[horizon]
              };
              return;
            }
            
            // Otherwise generate a simple forecast
            const prices = mockData.priceHistory[code];
            if (!prices || prices.length === 0) {
              results[code] = { error: 'No price data available' };
              return;
            }
            
            const latestPrice = prices[prices.length - 1];
            const randomChange = (Math.random() * 0.2) - 0.1; // -10% to +10%
            
            results[code] = {
              description: hsCode.description,
              forecast: {
                hsCode: code,
                date: new Date(Date.now() + getHorizonDays(horizon) * 24 * 60 * 60 * 1000).toISOString(),
                predictedPrice: latestPrice.price * (1 + randomChange),
                confidenceInterval: {
                  lower: latestPrice.price * (1 + randomChange - 0.1),
                  upper: latestPrice.price * (1 + randomChange + 0.1)
                },
                confidenceScore: 70,
                factors: [
                  {
                    name: "Market trends",
                    impact: randomChange > 0 ? 0.5 : -0.5,
                    description: randomChange > 0 ? "Increasing demand" : "Decreasing demand"
                  }
                ],
                modelVersion: "v1.0-demo",
                currency: latestPrice.currency,
                unit: latestPrice.unit,
                horizon,
                createdAt: new Date().toISOString()
              }
            };
          });
          
          resolve({
            data: {
              status: 'success',
              horizon,
              data: results
            }
          });
        }, 800);
      });
    } else {
      return api.post('/api/forecasts/compare', { codes }, { params });
    }
  }
};

// Helper function to convert horizon to days
function getHorizonDays(horizon) {
  switch (horizon) {
    case '1d': return 1;
    case '1w': return 7;
    case '1m': return 30;
    case '3m': return 90;
    case '6m': return 180;
    case '1y': return 365;
    default: return 30;
  }
}

// Helper function to check backend status
export const checkBackendStatus = async () => {
  try {
    const response = await axios.get('/health', { timeout: 3000 });
    if (response.data.status === 'UP') {
      // Backend is available, clear fallback flag
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('USE_MOCK_DATA_FALLBACK');
      }
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Backend health check failed, using mock data');
    // Set fallback flag
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('USE_MOCK_DATA_FALLBACK', 'true');
    }
    return false;
  }
};

// Try to check backend status on initial load
if (typeof window !== 'undefined') {
  checkBackendStatus();
}

export default api;