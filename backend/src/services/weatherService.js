const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const OPENWEATHERMAP_API_URL = process.env.OPENWEATHERMAP_API_URL || 'https://api.openweathermap.org/data/2.5';
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

/**
 * Service for weather data and weather-related risks
 */
class WeatherService {
  /**
   * Get weather forecast for a specific region
   * @param {string} region - Region name (city, country, etc.)
   * @returns {Promise<Array>} - Array of weather risks
   */
  async getWeatherForecast(region) {
    try {
      // Check if API key is available and valid
      if (!OPENWEATHERMAP_API_KEY || OPENWEATHERMAP_API_KEY.includes('real_openweathermap_api_key_here')) {
        console.log(`Using fallback weather data for ${region} because no valid API key is configured`);
        return this.getFallbackWeatherRisks(region);
      }
      
      try {
        console.log(`Fetching real weather data from OpenWeatherMap for region: ${region}`);
        
        const response = await axios.get(`${OPENWEATHERMAP_API_URL}/forecast`, {
          params: {
            q: region,
            appid: OPENWEATHERMAP_API_KEY,
            units: 'metric' // Use Celsius
          }
        });
        
        if (!response.data || !response.data.list) {
          console.warn('Invalid response structure from OpenWeatherMap');
          return this.getFallbackWeatherRisks(region);
        }
        
        console.log(`Successfully retrieved weather forecast with ${response.data.list.length} time points for ${region}`);
        
        // Process forecast data to identify risks
        return this.identifyWeatherRisks(response.data, region);
      } catch (apiError) {
        console.error(`Error fetching weather from API for ${region}:`, apiError.message);
        if (apiError.response) {
          console.error(`  Status: ${apiError.response.status}`);
          console.error(`  Details: ${JSON.stringify(apiError.response.data)}`);
        }
        return this.getFallbackWeatherRisks(region);
      }
    } catch (error) {
      console.error(`General error in weather service for ${region}:`, error);
      return this.getFallbackWeatherRisks(region);
    }
  }
  
  /**
   * Generate fallback weather risks for development
   * @param {string} region - Region name
   * @returns {Array} - Simulated weather risks
   */
  getFallbackWeatherRisks(region) {
    console.log(`Generating fallback weather risks for ${region}`);
    
    // Map regions to likely weather patterns for realism
    const regionWeatherPatterns = {
      'Argentina': ['drought', 'heatwave'],
      'Brazil': ['rainfall', 'flooding'],
      'United States': ['tornado', 'drought'],
      'China': ['flooding', 'smog']
    };
    
    // Get weather patterns for this region or use defaults
    const patterns = regionWeatherPatterns[region] || ['rainfall', 'heatwave', 'drought', 'flooding'];
    
    // Generate 1-2 random risks from the patterns
    const risks = [];
    const numRisks = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < numRisks; i++) {
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 5));
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 7) + 3);
      
      const severity = Math.floor(Math.random() * 3) + 2; // 2-4 severity
      
      let title, description;
      switch (pattern) {
        case 'drought':
          title = `Drought Conditions in ${region}`;
          description = `Extended dry period expected to affect agricultural production in ${region}`;
          break;
        case 'heatwave':
          title = `Heatwave Warning for ${region}`;
          description = `Temperatures expected to exceed seasonal norms in ${region}`;
          break;
        case 'rainfall':
          title = `Heavy Rainfall in ${region}`;
          description = `Above average precipitation expected in ${region}`;
          break;
        case 'flooding':
          title = `Flood Risk in ${region}`;
          description = `Potential flooding in low-lying areas of ${region}`;
          break;
        case 'tornado':
          title = `Tornado Warning for ${region}`;
          description = `Severe weather conditions with tornado potential in ${region}`;
          break;
        case 'smog':
          title = `Air Quality Alert for ${region}`;
          description = `Poor air quality expected to affect transportation and logistics in ${region}`;
          break;
      }
      
      risks.push(this.createRisk({
        type: 'weather',
        severity,
        title,
        description,
        region,
        startDate,
        endDate,
        impactDirection: pattern === 'drought' || pattern === 'heatwave' ? 'increase' : 'decrease'
      }));
    }
    
    return risks;
  }
  
  /**
   * Identify weather risks from forecast data
   * @param {Object} forecastData - OpenWeatherMap forecast data
   * @param {string} region - Region name
   * @returns {Array} - Identified weather risks
   */
  identifyWeatherRisks(forecastData, region) {
    const risks = [];
    
    // Skip if forecast list is missing
    if (!forecastData.list || !Array.isArray(forecastData.list)) {
      return risks;
    }
    
    // Thresholds for different weather conditions
    const thresholds = {
      highTemp: 35, // Celsius
      lowTemp: 0,   // Celsius
      heavyRain: 20, // mm per 3 hours
      strongWind: 15 // m/s
    };
    
    // Check each forecast point (typically every 3 hours for 5 days)
    forecastData.list.forEach(point => {
      const date = new Date(point.dt * 1000);
      
      // Check for extreme heat
      if (point.main.temp > thresholds.highTemp) {
        risks.push(this.createRisk({
          type: 'weather',
          severity: Math.min(5, Math.round((point.main.temp - thresholds.highTemp) / 5) + 1),
          title: `Extreme Heat in ${region}`,
          description: `Temperature expected to reach ${point.main.temp.toFixed(1)}°C on ${date.toDateString()}`,
          region,
          startDate: date,
          endDate: new Date(date.getTime() + 24 * 60 * 60 * 1000),
          impactDirection: 'increase'
        }));
      }
      
      // Check for extreme cold
      if (point.main.temp < thresholds.lowTemp) {
        risks.push(this.createRisk({
          type: 'weather',
          severity: Math.min(5, Math.round((thresholds.lowTemp - point.main.temp) / 5) + 1),
          title: `Extreme Cold in ${region}`,
          description: `Temperature expected to drop to ${point.main.temp.toFixed(1)}°C on ${date.toDateString()}`,
          region,
          startDate: date,
          endDate: new Date(date.getTime() + 24 * 60 * 60 * 1000),
          impactDirection: 'increase'
        }));
      }
      
      // Check for heavy rainfall
      if (point.rain && point.rain['3h'] && point.rain['3h'] > thresholds.heavyRain) {
        risks.push(this.createRisk({
          type: 'weather',
          severity: Math.min(5, Math.round(point.rain['3h'] / thresholds.heavyRain)),
          title: `Heavy Rainfall in ${region}`,
          description: `Heavy rainfall of ${point.rain['3h'].toFixed(1)}mm expected on ${date.toDateString()}`,
          region,
          startDate: date,
          endDate: new Date(date.getTime() + 24 * 60 * 60 * 1000),
          impactDirection: 'increase'
        }));
      }
      
      // Check for strong winds
      if (point.wind && point.wind.speed > thresholds.strongWind) {
        risks.push(this.createRisk({
          type: 'weather',
          severity: Math.min(5, Math.round(point.wind.speed / thresholds.strongWind)),
          title: `Strong Winds in ${region}`,
          description: `Strong winds of ${point.wind.speed.toFixed(1)}m/s expected on ${date.toDateString()}`,
          region,
          startDate: date,
          endDate: new Date(date.getTime() + 24 * 60 * 60 * 1000),
          impactDirection: 'increase'
        }));
      }
    });
    
    // Consolidate similar risks
    return this.consolidateRisks(risks);
  }
  
  /**
   * Create a risk object with default values
   * @param {Object} params - Risk parameters
   * @returns {Object} - Complete risk object
   */
  createRisk({
    type,
    severity,
    title,
    description,
    region,
    startDate,
    endDate,
    impactDirection
  }) {
    return {
      type,
      severity,
      title,
      description,
      affectedHsCodes: this.mapRegionToHsCodes(region, type),
      affectedRegions: [region],
      source: 'OpenWeatherMap',
      sourceUrl: 'https://openweathermap.org',
      startDate,
      endDate,
      expectedPriceImpact: {
        direction: impactDirection,
        percentage: severity * 5, // Rough estimate based on severity
        confidence: 50 + severity * 5 // Higher severity = higher confidence
      },
      mitigationSteps: this.getMitigationSteps(type),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  /**
   * Map region to potentially affected HS codes
   * @param {string} region - Region name
   * @param {string} riskType - Type of risk
   * @returns {Array} - HS codes likely affected
   */
  mapRegionToHsCodes(region, riskType) {
    // This would be more sophisticated in production
    // with a proper database of regional commodity production
    
    const regionToHsCodes = {
      'Argentina': ['120190', '020130', '100590'],
      'Brazil': ['120190', '090111', '100590'],
      'United States': ['100590', '120190', '080810'],
      'China': ['520100', '848180', '851762']
      // Add more regions as needed
    };
    
    // Modify based on risk type
    if (riskType === 'weather') {
      // Weather typically affects agricultural products
      const allCodes = regionToHsCodes[region] || [];
      return allCodes.filter(code => 
        code.startsWith('01') || code.startsWith('02') || 
        code.startsWith('07') || code.startsWith('08') || 
        code.startsWith('10') || code.startsWith('12')
      );
    }
    
    return regionToHsCodes[region] || [];
  }
  
  /**
   * Get mitigation steps based on risk type
   * @param {string} riskType - Type of risk
   * @returns {Array} - Mitigation steps
   */
  getMitigationSteps(riskType) {
    if (riskType === 'weather') {
      return [
        'Diversify sourcing to other regions',
        'Secure supply contracts in advance',
        'Consider weather derivatives or insurance',
        'Monitor forecasts for updates'
      ];
    }
    
    return ['Review risk management strategy', 'Prepare contingency plans'];
  }
  
  /**
   * Consolidate similar risks to avoid duplication
   * @param {Array} risks - List of identified risks
   * @returns {Array} - Consolidated risks
   */
  consolidateRisks(risks) {
    const consolidatedRisks = [];
    const riskGroups = {};
    
    // Group similar risks
    risks.forEach(risk => {
      const key = `${risk.type}_${risk.title.split(' in ')[0]}`;
      if (!riskGroups[key]) {
        riskGroups[key] = [];
      }
      riskGroups[key].push(risk);
    });
    
    // Create consolidated risk for each group
    Object.values(riskGroups).forEach(group => {
      if (group.length === 0) return;
      
      if (group.length === 1) {
        consolidatedRisks.push(group[0]);
        return;
      }
      
      // Find max severity
      const maxSeverity = Math.max(...group.map(r => r.severity));
      
      // Find date range
      const allDates = group.flatMap(r => [r.startDate, r.endDate]);
      const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
      
      // Create consolidated risk
      const baseRisk = group[0];
      consolidatedRisks.push({
        ...baseRisk,
        severity: maxSeverity,
        description: `${baseRisk.description.split(' on ')[0]} between ${minDate.toDateString()} and ${maxDate.toDateString()}`,
        startDate: minDate,
        endDate: maxDate,
        expectedPriceImpact: {
          ...baseRisk.expectedPriceImpact,
          percentage: maxSeverity * 5,
          confidence: 50 + maxSeverity * 5
        }
      });
    });
    
    return consolidatedRisks;
  }
}

module.exports = new WeatherService();