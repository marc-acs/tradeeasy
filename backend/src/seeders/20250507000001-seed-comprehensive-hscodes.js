'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create a large batch of HS Codes
    const hsCodes = [
      // Section I: Live Animals; Animal Products
      {
        code: "010121",
        description: "Pure-bred breeding horses",
        section: "I",
        chapter: "01",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "010129",
        description: "Live horses, other than pure-bred breeding animals",
        section: "I",
        chapter: "01",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "010221",
        description: "Pure-bred breeding cattle",
        section: "I",
        chapter: "01",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "010229",
        description: "Live cattle, other than pure-bred breeding animals",
        section: "I",
        chapter: "01",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "010391",
        description: "Live swine, weighing less than 50 kg",
        section: "I",
        chapter: "01",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "010392",
        description: "Live swine, weighing 50 kg or more",
        section: "I",
        chapter: "01",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "020110",
        description: "Carcases and half-carcases of bovine animals, fresh or chilled",
        section: "I",
        chapter: "02",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "020120",
        description: "Other cuts of bovine animals with bone in, fresh or chilled",
        section: "I",
        chapter: "02",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "020220",
        description: "Other cuts of bovine animals with bone in, frozen",
        section: "I",
        chapter: "02",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "020230",
        description: "Boneless cuts of bovine animals, frozen",
        section: "I",
        chapter: "02",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "020311",
        description: "Carcases and half-carcases of swine, fresh or chilled",
        section: "I",
        chapter: "02",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "020319",
        description: "Other meat of swine, fresh or chilled",
        section: "I",
        chapter: "02",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "030213",
        description: "Pacific salmon, fresh or chilled",
        section: "I",
        chapter: "03",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "030214",
        description: "Atlantic salmon and Danube salmon, fresh or chilled",
        section: "I",
        chapter: "03",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "030312",
        description: "Pacific salmon, frozen, excluding fillets, livers and roes",
        section: "I",
        chapter: "03",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "040110",
        description: "Milk and cream, not concentrated, fat content not exceeding 1%",
        section: "I",
        chapter: "04",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "040120",
        description: "Milk and cream, not concentrated, fat content exceeding 1% but not exceeding 6%",
        section: "I",
        chapter: "04",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "040150",
        description: "Milk and cream, not concentrated, fat content exceeding 10%",
        section: "I",
        chapter: "04",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "040510",
        description: "Butter",
        section: "I",
        chapter: "04",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "040610",
        description: "Fresh cheese, including whey cheese, and curd",
        section: "I",
        chapter: "04",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "040630",
        description: "Processed cheese, not grated or powdered",
        section: "I",
        chapter: "04",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "040690",
        description: "Other cheese",
        section: "I",
        chapter: "04",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Section II: Vegetable Products
      {
        code: "070110",
        description: "Seed potatoes",
        section: "II",
        chapter: "07",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "070190",
        description: "Potatoes, fresh or chilled (excl. seed)",
        section: "II",
        chapter: "07",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "070200",
        description: "Tomatoes, fresh or chilled",
        section: "II",
        chapter: "07",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "070310",
        description: "Onions and shallots, fresh or chilled",
        section: "II",
        chapter: "07",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "070390",
        description: "Leeks and other alliaceous vegetables, fresh or chilled",
        section: "II",
        chapter: "07",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "070410",
        description: "Cauliflowers and broccoli, fresh or chilled",
        section: "II",
        chapter: "07",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "070960",
        description: "Peppers of the genus Capsicum or Pimenta, fresh or chilled",
        section: "II",
        chapter: "07",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "070970",
        description: "Spinach, fresh or chilled",
        section: "II",
        chapter: "07",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "080310",
        description: "Plantains",
        section: "II",
        chapter: "08",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "080390",
        description: "Bananas, excluding plantains",
        section: "II",
        chapter: "08",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "080410",
        description: "Dates, fresh or dried",
        section: "II",
        chapter: "08",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "080440",
        description: "Avocados, fresh or dried",
        section: "II",
        chapter: "08",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "080450",
        description: "Guavas, mangoes and mangosteens, fresh or dried",
        section: "II",
        chapter: "08",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "080510",
        description: "Oranges, fresh or dried",
        section: "II",
        chapter: "08",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "080520",
        description: "Mandarins, fresh or dried",
        section: "II",
        chapter: "08",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "080610",
        description: "Grapes, fresh",
        section: "II",
        chapter: "08",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "080620",
        description: "Grapes, dried (raisins)",
        section: "II",
        chapter: "08",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "080810",
        description: "Apples, fresh",
        section: "II",
        chapter: "08",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "080830",
        description: "Pears, fresh",
        section: "II",
        chapter: "08",
        searchCount: 0,
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
      },
      {
        code: "090112",
        description: "Coffee, not roasted, decaffeinated",
        section: "II",
        chapter: "09",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "090121",
        description: "Coffee, roasted, not decaffeinated",
        section: "II",
        chapter: "09",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "090210",
        description: "Green tea (not fermented) in immediate packings <= 3 kg",
        section: "II",
        chapter: "09",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "090230",
        description: "Black tea (fermented) in immediate packings <= 3 kg",
        section: "II",
        chapter: "09",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "090411",
        description: "Pepper of the genus Piper, neither crushed nor ground",
        section: "II",
        chapter: "09",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "090500",
        description: "Vanilla",
        section: "II",
        chapter: "09",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "090700",
        description: "Cloves (whole fruit, cloves and stems)",
        section: "II",
        chapter: "09",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "100111",
        description: "Durum wheat, seed",
        section: "II",
        chapter: "10",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "100119",
        description: "Durum wheat, other than seed",
        section: "II",
        chapter: "10",
        searchCount: 0,
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
        code: "100510",
        description: "Maize (corn), seed",
        section: "II",
        chapter: "10",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "100590",
        description: "Maize (corn), other than seed",
        section: "II",
        chapter: "10",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "100610",
        description: "Rice in the husk (paddy or rough)",
        section: "II",
        chapter: "10",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "100630",
        description: "Semi-milled or wholly milled rice",
        section: "II",
        chapter: "10",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "110100",
        description: "Wheat or meslin flour",
        section: "II",
        chapter: "11",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "110220",
        description: "Maize (corn) flour",
        section: "II",
        chapter: "11",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "110290",
        description: "Cereal flours other than of wheat, meslin, rye, maize, rice",
        section: "II",
        chapter: "11",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
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
        code: "120510",
        description: "Low erucic acid rape or colza seeds",
        section: "II",
        chapter: "12",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "120600",
        description: "Sunflower seeds, whether or not broken",
        section: "II",
        chapter: "12",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Section III: Animal or Vegetable Fats and Oils
      {
        code: "150110",
        description: "Pig fat (including lard)",
        section: "III",
        chapter: "15",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "150710",
        description: "Crude soybean oil",
        section: "III",
        chapter: "15",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "150790",
        description: "Soybean oil and its fractions, refined",
        section: "III",
        chapter: "15",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "151110",
        description: "Crude palm oil",
        section: "III",
        chapter: "15",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "151190",
        description: "Palm oil and its fractions, refined",
        section: "III",
        chapter: "15",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "151211",
        description: "Crude sunflower-seed or safflower oil",
        section: "III",
        chapter: "15",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "151219",
        description: "Sunflower-seed or safflower oil and fractions thereof, refined",
        section: "III",
        chapter: "15",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "151411",
        description: "Crude low erucic acid rape or colza oil",
        section: "III",
        chapter: "15",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "151419",
        description: "Low erucic acid rape or colza oil, refined",
        section: "III",
        chapter: "15",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "151620",
        description: "Vegetable fats and oils and their fractions, hydrogenated",
        section: "III",
        chapter: "15",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Section IV: Prepared Foodstuffs, Beverages, Spirits and Vinegar; Tobacco
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
        code: "160232",
        description: "Prepared or preserved meat or meat offal of fowls of the species Gallus domesticus",
        section: "IV",
        chapter: "16",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "160250",
        description: "Prepared or preserved meat or meat offal of bovine animals",
        section: "IV",
        chapter: "16",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "170112",
        description: "Raw beet sugar",
        section: "IV",
        chapter: "17",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "170113",
        description: "Raw cane sugar",
        section: "IV",
        chapter: "17",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "170199",
        description: "Refined cane or beet sugar, in solid form",
        section: "IV",
        chapter: "17",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "170290",
        description: "Other sugars, including invert sugar and other sugar and sugar syrup blends",
        section: "IV",
        chapter: "17",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "180100",
        description: "Cocoa beans, whole or broken, raw or roasted",
        section: "IV",
        chapter: "18",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "180310",
        description: "Cocoa paste, not defatted",
        section: "IV",
        chapter: "18",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "180400",
        description: "Cocoa butter, fat and oil",
        section: "IV",
        chapter: "18",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "180500",
        description: "Cocoa powder, not containing added sugar or sweetening matter",
        section: "IV",
        chapter: "18",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "180620",
        description: "Other preparations in blocks, slabs or bars > 2kg",
        section: "IV",
        chapter: "18",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "180631",
        description: "Chocolate and other food preparations containing cocoa, in blocks, slabs or bars, filled",
        section: "IV",
        chapter: "18",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "180632",
        description: "Chocolate and other food preparations containing cocoa, in blocks, slabs or bars, not filled",
        section: "IV",
        chapter: "18",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "190110",
        description: "Preparations for infant use, retail sale",
        section: "IV",
        chapter: "19",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "190211",
        description: "Uncooked pasta, not stuffed, containing eggs",
        section: "IV",
        chapter: "19",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "190219",
        description: "Uncooked pasta, not stuffed, not containing eggs",
        section: "IV",
        chapter: "19",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "190230",
        description: "Other pasta",
        section: "IV",
        chapter: "19",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "220110",
        description: "Mineral waters and aerated waters",
        section: "IV",
        chapter: "22",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "220300",
        description: "Beer made from malt",
        section: "IV",
        chapter: "22",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "220410",
        description: "Sparkling wine of fresh grapes",
        section: "IV",
        chapter: "22",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "220421",
        description: "Wine of fresh grapes in containers of 2 l or less",
        section: "IV",
        chapter: "22",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "220429",
        description: "Wine of fresh grapes in containers of > 2 l",
        section: "IV",
        chapter: "22",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "220830",
        description: "Whiskies",
        section: "IV",
        chapter: "22",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "240110",
        description: "Tobacco, not stemmed or stripped",
        section: "IV",
        chapter: "24",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "240120",
        description: "Tobacco, partly or wholly stemmed or stripped",
        section: "IV",
        chapter: "24",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Section V: Mineral Products
      {
        code: "250100",
        description: "Salt (including table salt and denatured salt)",
        section: "V",
        chapter: "25",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "252310",
        description: "Cement clinkers",
        section: "V",
        chapter: "25",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "252329",
        description: "Portland cement (excl. white)",
        section: "V",
        chapter: "25",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "260111",
        description: "Iron ores and concentrates, non-agglomerated",
        section: "V",
        chapter: "26",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "260112",
        description: "Iron ores and concentrates, agglomerated",
        section: "V",
        chapter: "26",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "260300",
        description: "Copper ores and concentrates",
        section: "V",
        chapter: "26",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "270112",
        description: "Bituminous coal",
        section: "V",
        chapter: "27",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "270119",
        description: "Other coal",
        section: "V",
        chapter: "27",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "270900",
        description: "Petroleum oils, crude",
        section: "V",
        chapter: "27",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "271011",
        description: "Light oils and preparations",
        section: "V",
        chapter: "27",
        searchCount: 0,
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
        code: "271112",
        description: "Propane, liquefied",
        section: "V",
        chapter: "27",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "271113",
        description: "Butanes, liquefied",
        section: "V",
        chapter: "27",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "271119",
        description: "Other liquefied petroleum gases",
        section: "V",
        chapter: "27",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "271121",
        description: "Natural gas in gaseous state",
        section: "V",
        chapter: "27",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Section XV: Base Metals and Articles of Base Metal
      {
        code: "720110",
        description: "Non-alloy pig iron containing by weight <= 0.5% phosphorus",
        section: "XV",
        chapter: "72",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "720221",
        description: "Ferro-silicon, containing by weight > 55% of silicon",
        section: "XV",
        chapter: "72",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "720241",
        description: "Ferro-chromium, containing by weight > 4% of carbon",
        section: "XV",
        chapter: "72",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "720712",
        description: "Semi-finished products of iron or non-alloy steel, < 0.25% carbon, rectangular, not square",
        section: "XV",
        chapter: "72",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "721049",
        description: "Flat-rolled products of iron or non-alloy steel, width >= 600 mm, plated or coated with zinc, not corrugated",
        section: "XV",
        chapter: "72",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "730690",
        description: "Other tubes, pipes and hollow profiles of iron or steel",
        section: "XV",
        chapter: "73",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "740311",
        description: "Copper cathodes and sections of cathodes, unwrought",
        section: "XV",
        chapter: "74",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "740811",
        description: "Wire of refined copper, maximum cross-sectional dimension > 6 mm",
        section: "XV",
        chapter: "74",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "750110",
        description: "Nickel mattes",
        section: "XV",
        chapter: "75",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "750210",
        description: "Nickel, not alloyed, unwrought",
        section: "XV",
        chapter: "75",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "760110",
        description: "Aluminium, not alloyed, unwrought",
        section: "XV",
        chapter: "76",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "760120",
        description: "Aluminium alloys, unwrought",
        section: "XV",
        chapter: "76",
        searchCount: 65,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "760200",
        description: "Aluminium waste and scrap",
        section: "XV",
        chapter: "76",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "760611",
        description: "Plates, sheets and strip, of aluminium, not alloyed, thickness > 0.2 mm, rectangular or square",
        section: "XV",
        chapter: "76",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "760612",
        description: "Plates, sheets and strip, of aluminium alloys, thickness > 0.2 mm, rectangular or square",
        section: "XV",
        chapter: "76",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "760711",
        description: "Aluminium foil, not backed, rolled but not further worked, thickness <= 0.2 mm",
        section: "XV",
        chapter: "76",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "780110",
        description: "Unwrought lead, refined",
        section: "XV",
        chapter: "78",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "790111",
        description: "Zinc, not alloyed, unwrought, >= 99.99% zinc",
        section: "XV",
        chapter: "79",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "800110",
        description: "Tin, not alloyed, unwrought",
        section: "XV",
        chapter: "80",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Section XVI: Machinery and Mechanical Appliances; Electrical Equipment; Parts Thereof
      {
        code: "840734",
        description: "Spark-ignition reciprocating piston engines of a cylinder capacity > 1000 cc",
        section: "XVI",
        chapter: "84",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "840890",
        description: "Compression-ignition internal combustion piston engines (diesel or semi-diesel engines)",
        section: "XVI",
        chapter: "84",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "841112",
        description: "Turbojets of a thrust > 25 kN",
        section: "XVI",
        chapter: "84",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "841191",
        description: "Parts of turbojets or turbopropellers",
        section: "XVI",
        chapter: "84",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "841480",
        description: "Other air or gas compressors and hoods",
        section: "XVI",
        chapter: "84",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "842230",
        description: "Machinery for filling, closing, sealing or labelling bottles, cans, etc.",
        section: "XVI",
        chapter: "84",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "842952",
        description: "Mechanical shovels and excavators with 360° revolving superstructure",
        section: "XVI",
        chapter: "84",
        searchCount: 0,
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
        code: "847130",
        description: "Portable automatic data processing machines, weight <= 10 kg",
        section: "XVI",
        chapter: "84",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "847150",
        description: "Processing units for automatic data processing machines",
        section: "XVI",
        chapter: "84",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "847160",
        description: "Input or output units for automatic data processing machines",
        section: "XVI",
        chapter: "84",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "847170",
        description: "Storage units for automatic data processing machines",
        section: "XVI",
        chapter: "84",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "847989",
        description: "Other machines and mechanical appliances",
        section: "XVI",
        chapter: "84",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "850440",
        description: "Static converters",
        section: "XVI",
        chapter: "85",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "851762",
        description: "Machines for the reception, conversion and transmission or regeneration of voice, images or other data",
        section: "XVI",
        chapter: "85",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "854231",
        description: "Electronic integrated circuits: processors and controllers",
        section: "XVI",
        chapter: "85",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "854239",
        description: "Other electronic integrated circuits",
        section: "XVI",
        chapter: "85",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "854442",
        description: "Electric conductors for a voltage <= 1000 V, insulated, fitted with connectors",
        section: "XVI",
        chapter: "85",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Section XVII: Vehicles, Aircraft, Vessels and Associated Transport Equipment
      {
        code: "870321",
        description: "Motor cars with spark-ignition engine of a cylinder capacity <= 1000 cc",
        section: "XVII",
        chapter: "87",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "870322",
        description: "Motor cars with spark-ignition engine of a cylinder capacity > 1000 cc but <= 1500 cc",
        section: "XVII",
        chapter: "87",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "870323",
        description: "Motor cars with spark-ignition engine of a cylinder capacity > 1500 cc but <= 3000 cc",
        section: "XVII",
        chapter: "87",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "870324",
        description: "Motor cars with spark-ignition engine of a cylinder capacity > 3000 cc",
        section: "XVII",
        chapter: "87",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "870332",
        description: "Motor cars with compression-ignition engine (diesel) of a cylinder capacity > 1500 cc but <= 2500 cc",
        section: "XVII",
        chapter: "87",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "870333",
        description: "Motor cars with compression-ignition engine (diesel) of a cylinder capacity > 2500 cc",
        section: "XVII",
        chapter: "87",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "870421",
        description: "Motor vehicles for the transport of goods, with compression-ignition engine (diesel), g.v.w. <= 5 tonnes",
        section: "XVII",
        chapter: "87",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "870431",
        description: "Motor vehicles for the transport of goods, with spark-ignition engine, g.v.w. <= 5 tonnes",
        section: "XVII",
        chapter: "87",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "870840",
        description: "Gear boxes and parts thereof, for tractors, motor vehicles",
        section: "XVII",
        chapter: "87",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "870850",
        description: "Drive-axles with differential for motor vehicles",
        section: "XVII",
        chapter: "87",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "870870",
        description: "Road wheels and parts and accessories thereof, for tractors, motor vehicles",
        section: "XVII",
        chapter: "87",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "870880",
        description: "Suspension systems and parts thereof, for tractors, motor vehicles",
        section: "XVII",
        chapter: "87",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "870892",
        description: "Silencers (mufflers) and exhaust pipes; parts thereof",
        section: "XVII",
        chapter: "87",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "870899",
        description: "Other parts and accessories for tractors and motor vehicles",
        section: "XVII",
        chapter: "87",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "880240",
        description: "Aeroplanes and other aircraft of an unladen weight > 15000 kg",
        section: "XVII",
        chapter: "88",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "880330",
        description: "Parts of aeroplanes or helicopters, n.e.s.",
        section: "XVII",
        chapter: "88",
        searchCount: 0,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert in batches to handle the large dataset
    const batchSize = 50;
    for (let i = 0; i < hsCodes.length; i += batchSize) {
      const batch = hsCodes.slice(i, i + batchSize);
      await queryInterface.bulkInsert('hs_codes', batch, {
        updateOnDuplicate: ['description', 'section', 'chapter', 'updatedAt']
      });
    }

    console.log(`Added ${hsCodes.length} HS codes to the database`);
  },

  down: async (queryInterface, Sequelize) => {
    // This will delete all added HS codes except the original 8 seed codes
    const originalCodes = [
      "120190", "020130", "100199", "271019", 
      "760120", "843149", "160100", "090111"
    ];
    
    return queryInterface.bulkDelete('hs_codes', {
      code: { [Sequelize.Op.notIn]: originalCodes }
    }, {});
  }
};