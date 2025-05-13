'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seed HS Codes
    return queryInterface.bulkInsert('hs_codes', [
      {
        code: "120190",
        description: "Soybeans, whether or not broken",
        section: "II",
        chapter: "12",
        searchCount: 142,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "020130",
        description: "Meat of bovine animals, fresh or chilled, boneless",
        section: "I",
        chapter: "02",
        searchCount: 98,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "100199",
        description: "Wheat and meslin (excluding seed for sowing, and durum wheat)",
        section: "II",
        chapter: "10",
        searchCount: 87,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "271019",
        description: "Medium oils and preparations, of petroleum or bituminous minerals, not containing biodiesel",
        section: "V",
        chapter: "27",
        searchCount: 76,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "760120",
        description: "Aluminum alloys, unwrought",
        section: "XV",
        chapter: "76",
        searchCount: 65,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "843149",
        description: "Parts suitable for use solely or principally with the machinery of headings 8426, 8429, and 8430",
        section: "XVI",
        chapter: "84",
        searchCount: 54,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "160100",
        description: "Sausages and similar products, of meat, meat offal or blood",
        section: "IV",
        chapter: "16",
        searchCount: 48,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "090111",
        description: "Coffee, not roasted, not decaffeinated",
        section: "II",
        chapter: "09",
        searchCount: 62,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('hs_codes', null, {});
  }
};