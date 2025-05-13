const axios = require('axios');
const cheerio = require('cheerio');
const dotenv = require('dotenv');

dotenv.config();

const USITC_API_URL = process.env.USITC_API_URL || 'https://hts.usitc.gov/api';
const DATAWEB_API_URL = process.env.DATAWEB_API_URL || 'https://dataweb.usitc.gov/api/v1';
const DATAWEB_AUTH_TOKEN = process.env.DATAWEB_AUTH_TOKEN || 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIyMDAxNzAwIiwianRpIjoiMDAwMjk0NDUtNDBmMC00ZDVlLTkzZWMtNTRmNjliZTAxZjYwIiwiaXNzIjoiZGF0YXdlYiIsImlhdCI6MTc0NjU1MDY0MywiZXhwIjoxNzQ3NzYwMjQzfQ.yiHWAIZGL8fXiTYEP33WBZeqOZsB4Gh9p39O1tb0VaWBZTKjKW7Ya3sSwkIvfTTLdA36C98kgOTfDzuWwSNxVQ';

/**
 * Service for fetching and processing tariff data
 */
class TariffService {
  /**
   * Get current tariff information for an HS code
   * @param {string} hsCode - The HS code to look up
   * @param {string} country - Country code (defaults to 'US')
   * @returns {Promise<Object>} - Tariff information
   */
  async getTariffInfo(hsCode, country = 'US') {
    try {
      if (country !== 'US') {
        throw new Error('Only US tariffs are supported currently');
      }
      
      // First, try using DataWeb API with auth token if available
      if (DATAWEB_AUTH_TOKEN && !DATAWEB_AUTH_TOKEN.includes('your-dataweb-auth-token')) {
        try {
          console.log(`Fetching real tariff data from DataWeb API for HS code: ${hsCode}`);
          
          // Try multiple DataWeb API endpoints for maximum compatibility
          const possibleEndpoints = [
            `/tariffs/hs/${hsCode}`,
            `/hts/tariff/${hsCode}`,  // Alternative format
            `/search/tariff?q=${hsCode}`  // Search format
          ];
          
          let dataWebData = null;
          
          // Try each endpoint until we get a successful response
          for (const endpoint of possibleEndpoints) {
            try {
              console.log(`Trying DataWeb endpoint: ${endpoint}`);
              
              const response = await axios.get(`${DATAWEB_API_URL}${endpoint}`, {
                headers: {
                  'Authorization': `Bearer ${DATAWEB_AUTH_TOKEN}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (response.data && 
                  (response.data.results || response.data.data || response.data.tariffs)) {
                console.log(`Successfully retrieved tariff data for ${hsCode} from DataWeb using endpoint: ${endpoint}`);
                dataWebData = response.data;
                break; // Found data, stop trying other endpoints
              } else {
                console.log(`No data in response from ${endpoint}`);
              }
            } catch (endpointError) {
              console.log(`Endpoint ${endpoint} failed with: ${endpointError.message}`);
              // Continue to next endpoint
            }
          }
          
          if (dataWebData) {
            // Process DataWeb response
            return this.processDataWebResponse(dataWebData, hsCode);
          } else {
            console.warn(`No successful endpoint found for HS code ${hsCode} in DataWeb API`);
            // Fall through to try USITC API as backup
          }
        } catch (dataWebError) {
          console.error(`Error fetching tariff data from DataWeb API for HS code ${hsCode}:`, dataWebError.message);
          if (dataWebError.response) {
            console.error(`  Status: ${dataWebError.response.status}`);
            console.error(`  Details: ${JSON.stringify(dataWebError.response.data || {})}`);
          }
          // Fall through to try USITC API as backup
          console.log('Falling back to USITC API for tariff data');
        }
      }
      
      // Format HS code for USITC API (needs to include periods)
      const formattedHsCode = this.formatHsCodeForUsitc(hsCode);
      
      // If no formatted code, return null
      if (!formattedHsCode) {
        console.warn(`Cannot format HS code ${hsCode} for USITC API`);
        return this.getFallbackTariffData(hsCode);
      }
      
      try {
        console.log(`Fetching tariff data from USITC for HS code: ${hsCode} (formatted: ${formattedHsCode})`);
        
        // Call USITC API
        const response = await axios.get(`${USITC_API_URL}/search`, {
          params: {
            query: formattedHsCode,
            // Other parameters as needed
          }
        });
        
        console.log(`Successfully retrieved tariff data for ${hsCode} from USITC`);
        
        // Process the response
        return this.processUsitcResponse(response.data, hsCode);
      } catch (apiError) {
        console.error(`Error fetching tariff data from USITC API for HS code ${hsCode}:`, apiError.message);
        if (apiError.response) {
          console.error(`  Status: ${apiError.response.status}`);
          console.error(`  Details: ${JSON.stringify(apiError.response.data || {})}`);
        }
        
        // Fall back to generated data
        return this.getFallbackTariffData(hsCode);
      }
    } catch (error) {
      console.error(`General error fetching tariff data for HS code ${hsCode}:`, error);
      return this.getFallbackTariffData(hsCode);
    }
  }
  
  /**
   * Generate fallback tariff data
   * @param {string} hsCode - HS code
   * @returns {Object} - Fallback tariff data
   */
  getFallbackTariffData(hsCode) {
    return {
      hsCode,
      country: 'US',
      rate: 0, // Default to 0 when API fails
      unit: '%',
      notes: 'Fallback data - API unavailable',
      effectiveDate: new Date(),
      source: 'Fallback Data',
      lastUpdated: new Date()
    };
  }
  
  /**
   * Process DataWeb API response
   * @param {Object} data - DataWeb API response
   * @param {string} hsCode - Original HS code
   * @returns {Object} - Processed tariff information
   */
  processDataWebResponse(data, hsCode) {
    try {
      console.log('Processing DataWeb response:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
      
      // First, determine how to extract the tariff data based on response structure
      let tariffData = null;
      
      if (data.results && data.results.length > 0) {
        tariffData = data.results[0];
      } else if (data.data && data.data.length > 0) {
        tariffData = data.data[0];
      } else if (data.tariffs && data.tariffs.length > 0) {
        tariffData = data.tariffs[0];
      } else if (data.tariff) {
        tariffData = data.tariff;
      }
      
      // If still no data found
      if (!tariffData) {
        console.warn(`No tariff data structure found in DataWeb response for HS code ${hsCode}`);
        return this.getFallbackTariffData(hsCode);
      }
      
      console.log('Extracted tariff data:', JSON.stringify(tariffData, null, 2));
      
      // Look for general duty rate in various possible field names
      const rateCandidateFields = [
        'general_rate_of_duty',
        'general_duty_rate',
        'rate',
        'duty_rate',
        'column_1_rate'
      ];
      
      let rateValue = '0';
      let rateFieldUsed = null;
      
      for (const field of rateCandidateFields) {
        if (tariffData[field] && tariffData[field] !== '') {
          rateValue = tariffData[field];
          rateFieldUsed = field;
          break;
        }
      }
      
      console.log(`Using rate value from field "${rateFieldUsed}": ${rateValue}`);
      
      // Extract numeric rate value
      let numericRate = 0;
      const percentMatch = String(rateValue).match(/(\d+\.?\d*)%/);
      if (percentMatch) {
        numericRate = parseFloat(percentMatch[1]);
      } else {
        // Just try to parse as a number if no percentage sign
        const possibleNumber = parseFloat(String(rateValue).replace(/[^\d.]/g, ''));
        if (!isNaN(possibleNumber)) {
          numericRate = possibleNumber;
        }
      }
      
      // Determine unit
      const unit = String(rateValue).includes('%') ? '%' : 'USD';
      
      // Extract and normalize data
      const tariffInfo = {
        hsCode,
        country: 'US',
        rate: numericRate,
        unit: unit,
        specialPrograms: this.extractDataWebSpecialPrograms(tariffData),
        additionalDuties: [],
        quotas: {
          hasQuota: Boolean(tariffData.quota === 'Y' || tariffData.has_quota === true),
          details: tariffData.quota_description || tariffData.quota_details || ''
        },
        notes: tariffData.notes || tariffData.description || '',
        effectiveDate: new Date(),
        expirationDate: null,
        source: 'USITC DataWeb',
        lastUpdated: new Date()
      };
      
      return tariffInfo;
    } catch (error) {
      console.error('Error processing DataWeb response:', error);
      return this.getFallbackTariffData(hsCode);
    }
  }
  
  /**
   * Extract special programs from DataWeb response
   * @param {Object} tariffData - Tariff data from DataWeb
   * @returns {Array} - Special programs
   */
  extractDataWebSpecialPrograms(tariffData) {
    const programs = [];
    
    try {
      // Look for special programs in various possible structures
      
      // Option 1: Structured special program fields
      const specialProgramFields = [
        { field: 'special_program_1', code: 'SP1', name: 'Special Program 1' },
        { field: 'special_program_2', code: 'SP2', name: 'Special Program 2' },
        { field: 'special_rates', code: 'SP', name: 'Special Rates' },
        { field: 'special_duty_rate', code: 'SP', name: 'Special Duty Rate' }
      ];
      
      let hasFoundPrograms = false;
      
      // First try structured fields
      specialProgramFields.forEach(program => {
        if (tariffData[program.field]) {
          hasFoundPrograms = true;
          programs.push({
            name: program.name,
            code: program.code,
            rate: this.extractRateValue(tariffData[program.field]),
            description: `Special rate under ${program.name}`
          });
        }
      });
      
      // Option 2: special_programs array
      if (tariffData.special_programs && Array.isArray(tariffData.special_programs)) {
        hasFoundPrograms = true;
        tariffData.special_programs.forEach((spProgram, index) => {
          // Handle both object and string formats
          if (typeof spProgram === 'object') {
            programs.push({
              name: spProgram.name || `Special Program ${index + 1}`,
              code: spProgram.code || `SP${index + 1}`,
              rate: this.extractRateValue(spProgram.rate || '0'),
              description: spProgram.description || `Special rate under ${spProgram.name || 'program'}`
            });
          } else if (typeof spProgram === 'string' && spProgram.trim() !== '') {
            // Parse string format like "AU: Free", "CA: 5.2%"
            const match = spProgram.match(/([A-Z]{1,3}):\s*(.*)/);
            if (match) {
              const code = match[1].trim();
              const rateText = match[2].trim();
              
              programs.push({
                name: this.getProgramName(code),
                code,
                rate: this.extractRateValue(rateText),
                description: `Special rate under ${this.getProgramName(code)}`
              });
            } else {
              // Just use the string as is
              programs.push({
                name: `Special Program ${index + 1}`,
                code: `SP${index + 1}`,
                rate: this.extractRateValue(spProgram),
                description: `Special rate: ${spProgram}`
              });
            }
          }
        });
      }
      
      // Option 3: Look for "special" field containing all special programs in a string
      if (!hasFoundPrograms && tariffData.special) {
        const specialText = tariffData.special;
        // Split by semicolons or commas
        const specialRates = specialText.split(/[;,]/);
        
        specialRates.forEach((rateInfo, index) => {
          // Match pattern like "AU: Free"
          const programMatch = rateInfo.match(/([A-Z]{1,3}):\s*(.*)/);
          if (programMatch) {
            const code = programMatch[1].trim();
            const rateText = programMatch[2].trim();
            
            programs.push({
              name: this.getProgramName(code),
              code,
              rate: this.extractRateValue(rateText),
              description: `Special rate under ${this.getProgramName(code)}`
            });
          } else if (rateInfo.trim()) {
            // Just add as generic special program
            programs.push({
              name: `Special Program ${index + 1}`,
              code: `SP${index + 1}`,
              rate: this.extractRateValue(rateInfo),
              description: `Special rate: ${rateInfo.trim()}`
            });
          }
        });
      }
    } catch (error) {
      console.error('Error extracting special programs:', error);
    }
    
    return programs;
  }
  
  /**
   * Extract numeric rate value from rate text
   * @param {string} rateText - Rate text (e.g. "4.4%", "Free", etc.)
   * @returns {number} - Numeric rate value
   */
  extractRateValue(rateText) {
    if (!rateText) return 0;
    
    // Convert to string in case it's a number
    rateText = String(rateText);
    
    // Free
    if (rateText.toLowerCase().includes('free')) {
      return 0;
    }
    
    // Percentage (e.g., "4.4%")
    const percentMatch = rateText.match(/(\d+\.?\d*)%/);
    if (percentMatch) {
      return parseFloat(percentMatch[1]);
    }
    
    // Specific rate (e.g., "2.2¢/kg")
    const specificMatch = rateText.match(/(\d+\.?\d*)[¢$]/);
    if (specificMatch) {
      return parseFloat(specificMatch[1]);
    }
    
    // Just try to parse as a number
    const possibleNumber = parseFloat(rateText.replace(/[^\d.]/g, ''));
    if (!isNaN(possibleNumber)) {
      return possibleNumber;
    }
    
    // Default
    return 0;
  }
  
  /**
   * Format HS code for USITC API (with proper periods)
   * @param {string} hsCode - Raw HS code
   * @returns {string} - Formatted HS code
   */
  formatHsCodeForUsitc(hsCode) {
    if (!hsCode || hsCode.length < 4) {
      return null;
    }
    
    // Insert periods after positions 4 and 6
    // For example: '120190' becomes '1201.90'
    // This is the format used by USITC
    let formatted = hsCode.substring(0, 4);
    
    if (hsCode.length >= 6) {
      formatted += '.' + hsCode.substring(4, 6);
      
      if (hsCode.length >= 8) {
        formatted += '.' + hsCode.substring(6, 8);
        
        if (hsCode.length >= 10) {
          formatted += '.' + hsCode.substring(8, 10);
        }
      }
    }
    
    return formatted;
  }
  
  /**
   * Process USITC API response
   * @param {Object} data - API response data
   * @param {string} hsCode - Original HS code
   * @returns {Object} - Processed tariff information
   */
  processUsitcResponse(data, hsCode) {
    // If no results found
    if (!data || !data.results || data.results.length === 0) {
      return null;
    }
    
    // Find the exact match or closest match
    const match = data.results.find(item => 
      item.htsno.replace(/\./g, '') === hsCode
    ) || data.results[0];
    
    // Extract and normalize data
    const tariffInfo = {
      hsCode,
      country: 'US',
      rate: this.extractRate(match.general_duty_rate),
      unit: this.extractUnit(match.general_duty_rate),
      specialPrograms: this.extractSpecialPrograms(match),
      additionalDuties: this.extractAdditionalDuties(match),
      quotas: {
        hasQuota: match.quota === 'Y',
        details: match.quota_note
      },
      notes: match.chapter_notes || match.section_notes,
      effectiveDate: new Date(),
      expirationDate: null,
      source: 'USITC',
      lastUpdated: new Date()
    };
    
    return tariffInfo;
  }
  
  /**
   * Extract duty rate from text
   * @param {string} rateText - Duty rate text
   * @returns {number} - Numeric rate
   */
  extractRate(rateText) {
    if (!rateText) return 0;
    
    // Free
    if (rateText.toLowerCase().includes('free')) {
      return 0;
    }
    
    // Percentage (e.g., "4.4%")
    const percentMatch = rateText.match(/(\d+\.?\d*)%/);
    if (percentMatch) {
      return parseFloat(percentMatch[1]);
    }
    
    // Specific rate (e.g., "2.2¢/kg")
    const specificMatch = rateText.match(/(\d+\.?\d*)[¢$]/);
    if (specificMatch) {
      return parseFloat(specificMatch[1]);
    }
    
    // Default
    return 0;
  }
  
  /**
   * Extract unit from duty rate text
   * @param {string} rateText - Duty rate text
   * @returns {string} - Unit (%, USD/kg, etc.)
   */
  extractUnit(rateText) {
    if (!rateText) return '%';
    
    // Percentage
    if (rateText.includes('%')) {
      return '%';
    }
    
    // Cents per kg
    if (rateText.includes('¢/kg')) {
      return 'USD/kg';
    }
    
    // Cents per unit
    if (rateText.includes('¢ each')) {
      return 'USD/unit';
    }
    
    // Default
    return '%';
  }
  
  /**
   * Extract special program rates
   * @param {Object} match - Matched tariff item
   * @returns {Array} - Special programs with rates
   */
  extractSpecialPrograms(match) {
    const programs = [];
    
    // Process special rates if available
    if (match.special_duty_rates) {
      // Split by commas or semicolons
      const specialRates = match.special_duty_rates.split(/[,;]/);
      
      specialRates.forEach(rateInfo => {
        // Match pattern like "AR: Free"
        const programMatch = rateInfo.match(/([A-Z]{1,3}):\s*(.*)/);
        if (programMatch) {
          const code = programMatch[1].trim();
          const rateText = programMatch[2].trim();
          
          programs.push({
            name: this.getProgramName(code),
            code,
            rate: this.extractRate(rateText),
            description: `Special rate under ${this.getProgramName(code)}`
          });
        }
      });
    }
    
    return programs;
  }
  
  /**
   * Get program name from code
   * @param {string} code - Program code
   * @returns {string} - Program name
   */
  getProgramName(code) {
    const programNames = {
      'AU': 'Australia Free Trade Agreement',
      'BH': 'Bahrain Free Trade Agreement',
      'CA': 'Canada Agreement',
      'CL': 'Chile Free Trade Agreement',
      'CO': 'Colombia Trade Promotion Agreement',
      'DR': 'Dominican Republic-Central America Free Trade Agreement',
      'IL': 'Israel Free Trade Area Agreement',
      'JO': 'Jordan Free Trade Area Agreement',
      'KR': 'Korea Free Trade Agreement',
      'MA': 'Morocco Free Trade Agreement',
      'MX': 'Mexico Agreement',
      'OM': 'Oman Free Trade Agreement',
      'P': 'Generalized System of Preferences',
      'P+': 'GSP+ Program',
      'PA': 'Panama Trade Promotion Agreement',
      'PE': 'Peru Trade Promotion Agreement',
      'SG': 'Singapore Free Trade Agreement',
      'AR': 'Argentina Agreement',
      'BR': 'Brazil Agreement'
    };
    
    return programNames[code] || `${code} Program`;
  }
  
  /**
   * Extract additional duties
   * @param {Object} match - Matched tariff item
   * @returns {Array} - Additional duties
   */
  extractAdditionalDuties(match) {
    // This would need to be implemented based on USITC data structure
    // For now, we'll return an empty array
    return [];
  }
  
  /**
   * Calculate landed cost including duties and fees
   * @param {Object} params - Calculation parameters
   * @returns {Object} - Calculation results
   */
  calculateLandedCost({
    hsCode,
    importValue,
    country = 'US',
    specialProgram = null,
    quantity = null,
    quantityUnit = null,
    shippingMode = 'ocean'
  }) {
    // We'll need to implement a full calculation here,
    // but for now, we'll return a simple structure
    // with placeholders that the controller can fill in
    // with real tariff data
    
    return {
      hsCode,
      importValue,
      dutyDetails: {
        // These will be filled by the controller
        rate: 0,
        unit: '%',
        description: 'General duty rate',
        amount: 0
      },
      additionalDuties: [],
      fees: {
        mpf: this.calculateMPF(importValue),
        hmf: shippingMode === 'ocean' ? this.calculateHMF(importValue) : 0
      },
      totals: {
        duties: 0, // Will be filled by controller
        fees: 0,   // Will be filled by controller
        landedCost: importValue // Will be updated by controller
      }
    };
  }
  
  /**
   * Calculate Merchandise Processing Fee (MPF)
   * @param {number} importValue - Import value
   * @returns {number} - MPF amount
   */
  calculateMPF(importValue) {
    const rate = 0.3464; // %
    const minFee = 27.75;
    const maxFee = 538.40;
    
    let fee = (importValue * rate) / 100;
    
    if (fee < minFee) return minFee;
    if (fee > maxFee) return maxFee;
    return fee;
  }
  
  /**
   * Calculate Harbor Maintenance Fee (HMF)
   * @param {number} importValue - Import value
   * @returns {number} - HMF amount
   */
  calculateHMF(importValue) {
    const rate = 0.125; // %
    return (importValue * rate) / 100;
  }
}

module.exports = new TariffService();