'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Hash passwords for security
    const demoUserPassword = await bcrypt.hash('demopassword', 12);
    const adminUserPassword = await bcrypt.hash('adminpassword', 12);
    
    // Generate UUIDs for users
    const demoUserId = uuidv4();
    const adminUserId = uuidv4();
    
    // Seed users
    await queryInterface.bulkInsert('users', [
      {
        id: demoUserId,
        name: "Demo User",
        email: "demo@tradeeasy.com",
        password: demoUserPassword,
        role: "user",
        company: "TradeEasy Demo Co.",
        subscriptionPlan: "free",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: adminUserId,
        name: "Admin User",
        email: "admin@tradeeasy.com",
        password: adminUserPassword,
        role: "admin",
        company: "TradeEasy Admin",
        subscriptionPlan: "premium",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    
    // Add saved HS codes for users
    return queryInterface.bulkInsert('user_saved_hscodes', [
      {
        id: uuidv4(),
        userId: demoUserId,
        hsCode: "120190",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        userId: demoUserId,
        hsCode: "020130",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        userId: demoUserId,
        hsCode: "843149",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        userId: adminUserId,
        hsCode: "120190",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        userId: adminUserId,
        hsCode: "020130",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        userId: adminUserId,
        hsCode: "100199",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        userId: adminUserId,
        hsCode: "271019",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        userId: adminUserId,
        hsCode: "760120",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        userId: adminUserId,
        hsCode: "843149",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove user saved HS codes first
    await queryInterface.bulkDelete('user_saved_hscodes', null, {});
    
    // Then remove users
    return queryInterface.bulkDelete('users', null, {});
  }
};