// Mock data for demo mode
const mockData = {
  // HS Codes
  hsCodes: [
    {
      code: "120190",
      description: "Soybeans, whether or not broken",
      section: "2",
      chapter: "12",
      searchCount: 152,
      lastUpdated: new Date().toISOString()
    },
    {
      code: "020130",
      description: "Fresh or chilled bovine meat, boneless",
      section: "1",
      chapter: "02",
      searchCount: 98,
      lastUpdated: new Date().toISOString()
    },
    {
      code: "843149",
      description: "Parts for derricks, cranes, graders, excavators, etc.",
      section: "16",
      chapter: "84",
      searchCount: 63,
      lastUpdated: new Date().toISOString()
    },
    {
      code: "100590",
      description: "Corn (maize), other than seed",
      section: "2",
      chapter: "10",
      searchCount: 128,
      lastUpdated: new Date().toISOString()
    },
    {
      code: "851762",
      description: "Machines for the reception, conversion and transmission of voice, images or data",
      section: "16",
      chapter: "85",
      searchCount: 45,
      lastUpdated: new Date().toISOString()
    }
  ],
  
  // Price history data
  priceHistory: {
    "120190": generatePriceData(400, 550, 90, "USD", "ton"),
    "020130": generatePriceData(4200, 4800, 90, "USD", "ton"),
    "843149": generatePriceData(1200, 1500, 90, "USD", "unit"),
    "100590": generatePriceData(180, 240, 90, "USD", "ton"),
    "851762": generatePriceData(800, 950, 90, "USD", "unit")
  },
  
  // Tariff data
  tariffs: {
    "120190": {
      rate: 0.0,
      unit: "%",
      specialPrograms: [
        {
          name: "Free Trade Agreement - Argentina",
          code: "AR",
          rate: 0.0,
          description: "Zero tariff under US-Argentina agricultural agreement"
        }
      ],
      quotas: {
        hasQuota: false,
        details: null
      },
      notes: "No tariff applies to soybeans from most countries",
      effectiveDate: new Date(2022, 0, 1).toISOString(),
      expirationDate: null,
      source: "USITC",
      lastUpdated: new Date(2023, 6, 15).toISOString()
    },
    "020130": {
      rate: 4.4,
      unit: "%",
      specialPrograms: [
        {
          name: "Free Trade Agreement - Argentina",
          code: "AR",
          rate: 0.0,
          description: "Zero tariff under US-Argentina agricultural agreement"
        }
      ],
      quotas: {
        hasQuota: true,
        details: "Subject to annual quota of 20,000 tons"
      },
      notes: "Additional health inspection requirements apply",
      effectiveDate: new Date(2023, 0, 1).toISOString(),
      expirationDate: null,
      source: "USITC",
      lastUpdated: new Date(2023, 11, 5).toISOString()
    },
    "843149": {
      rate: 2.5,
      unit: "%",
      specialPrograms: [],
      quotas: {
        hasQuota: false,
        details: null
      },
      notes: null,
      effectiveDate: new Date(2023, 0, 1).toISOString(),
      expirationDate: null,
      source: "USITC",
      lastUpdated: new Date(2023, 3, 10).toISOString()
    }
  },
  
  // Risk alerts
  risks: [
    {
      _id: "risk1",
      type: "weather",
      severity: 4,
      title: "Drought in Argentina's Soybean Belt",
      description: "Severe drought conditions affecting major soybean growing regions in Argentina. Expected to impact crop yields by 25-30%.",
      affectedHsCodes: ["120190", "120810"],
      affectedRegions: ["Argentina", "South America"],
      source: "National Weather Service",
      sourceUrl: "https://www.weather.gov",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      expectedPriceImpact: {
        direction: "increase",
        percentage: 15,
        confidence: 80
      },
      mitigationSteps: [
        "Secure advance supply contracts",
        "Diversify sourcing to include Brazil and US",
        "Consider hedge positions"
      ],
      isActive: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: "risk2",
      type: "political",
      severity: 3,
      title: "New Export Regulations in Argentina",
      description: "Argentina's government has announced new export regulations affecting agricultural products, including taxes and documentation requirements.",
      affectedHsCodes: ["120190", "020130", "100590"],
      affectedRegions: ["Argentina"],
      source: "Argentina Ministry of Trade",
      sourceUrl: "https://www.argentina.gob.ar",
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: null,
      expectedPriceImpact: {
        direction: "increase",
        percentage: 8,
        confidence: 65
      },
      mitigationSteps: [
        "Consult with trade compliance experts",
        "Update documentation procedures",
        "Adjust pricing strategy"
      ],
      isActive: true,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: "risk3",
      type: "supply",
      severity: 5,
      title: "Port Workers Strike in Buenos Aires",
      description: "Dock workers at Buenos Aires port have announced a two-week strike starting next Monday, severely disrupting exports.",
      affectedHsCodes: ["120190", "020130", "100590", "843149", "851762"],
      affectedRegions: ["Argentina", "South America"],
      source: "International Transport Workers Federation",
      sourceUrl: "https://www.itfglobal.org",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      expectedPriceImpact: {
        direction: "increase",
        percentage: 25,
        confidence: 90
      },
      mitigationSteps: [
        "Expedite current shipments before strike begins",
        "Arrange alternative shipping routes through Uruguay",
        "Increase safety stock levels"
      ],
      isActive: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  
  // Forecast data
  forecasts: {
    "120190": {
      "1m": {
        hsCode: "120190",
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        predictedPrice: 540,
        confidenceInterval: {
          lower: 520,
          upper: 560
        },
        confidenceScore: 85,
        factors: [
          {
            name: "Drought in Argentina",
            impact: 0.8,
            description: "Severe drought affecting major production regions"
          },
          {
            name: "Strong Chinese demand",
            impact: 0.5,
            description: "Increased purchases from Chinese importers"
          },
          {
            name: "USD/ARS exchange rate",
            impact: -0.2,
            description: "Slight strengthening of Argentine Peso"
          }
        ],
        modelVersion: "v1.0",
        currency: "USD",
        unit: "ton",
        horizon: "1m",
        createdAt: new Date().toISOString()
      },
      "3m": {
        hsCode: "120190",
        date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        predictedPrice: 580,
        confidenceInterval: {
          lower: 550,
          upper: 610
        },
        confidenceScore: 75,
        factors: [
          {
            name: "Drought in Argentina",
            impact: 0.8,
            description: "Severe drought affecting major production regions"
          },
          {
            name: "Strong Chinese demand",
            impact: 0.5,
            description: "Increased purchases from Chinese importers"
          },
          {
            name: "USD/ARS exchange rate",
            impact: -0.2,
            description: "Slight strengthening of Argentine Peso"
          },
          {
            name: "Port workers strike",
            impact: 0.6,
            description: "Disruption in export logistics"
          }
        ],
        modelVersion: "v1.0",
        currency: "USD",
        unit: "ton",
        horizon: "3m",
        createdAt: new Date().toISOString()
      },
      "6m": {
        hsCode: "120190",
        date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        predictedPrice: 560,
        confidenceInterval: {
          lower: 510,
          upper: 610
        },
        confidenceScore: 65,
        factors: [
          {
            name: "New harvest in Brazil",
            impact: -0.6,
            description: "Increased supply from new harvest"
          },
          {
            name: "Strong Chinese demand",
            impact: 0.5,
            description: "Increased purchases from Chinese importers"
          },
          {
            name: "New export regulations",
            impact: 0.4,
            description: "New taxes on agricultural exports"
          }
        ],
        modelVersion: "v1.0",
        currency: "USD",
        unit: "ton",
        horizon: "6m",
        createdAt: new Date().toISOString()
      },
      "1y": {
        hsCode: "120190",
        date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        predictedPrice: 520,
        confidenceInterval: {
          lower: 450,
          upper: 590
        },
        confidenceScore: 55,
        factors: [
          {
            name: "Global agricultural policies",
            impact: -0.3,
            description: "Changes in major markets' agricultural policies"
          },
          {
            name: "Climate patterns",
            impact: 0.4,
            description: "Predicted La Niña event affecting yields"
          },
          {
            name: "Market adaptation",
            impact: -0.2,
            description: "Market adaptation to new trade patterns"
          }
        ],
        modelVersion: "v1.0",
        currency: "USD",
        unit: "ton",
        horizon: "1y",
        createdAt: new Date().toISOString()
      }
    }
  }
};

// Helper function to generate price history data
function generatePriceData(minPrice, maxPrice, days, currency, unit) {
  const data = [];
  let price = (minPrice + maxPrice) / 2;
  const volatility = (maxPrice - minPrice) * 0.05;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    
    // Add some random price movement
    price += (Math.random() - 0.5) * volatility;
    
    // Keep price within bounds
    if (price < minPrice) price = minPrice + volatility * Math.random();
    if (price > maxPrice) price = maxPrice - volatility * Math.random();
    
    data.push({
      date: date.toISOString(),
      price,
      currency,
      unit,
      source: "Quandl",
      notes: null
    });
  }
  
  return data;
}

export default mockData;