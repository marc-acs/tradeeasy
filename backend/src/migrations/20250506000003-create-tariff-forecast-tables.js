'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Tariffs table
    await queryInterface.createTable('tariffs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      hsCode: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: {
          model: 'hs_codes',
          key: 'code'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      country: {
        type: Sequelize.STRING(3),
        allowNull: false
      },
      rate: {
        type: Sequelize.DECIMAL(7, 2),
        allowNull: false
      },
      unit: {
        type: Sequelize.ENUM('%', 'USD/kg', 'USD/unit'),
        defaultValue: '%'
      },
      effectiveDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      expirationDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      source: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      sourceUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      lastUpdated: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create Tariff Special Programs table
    await queryInterface.createTable('tariff_special_programs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tariffId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tariffs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      code: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      rate: {
        type: Sequelize.DECIMAL(7, 2),
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });

    // Create Tariff Quotas table
    await queryInterface.createTable('tariff_quotas', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tariffId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tariffs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quotaLimit: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      quotaUnit: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      withinQuotaRate: {
        type: Sequelize.DECIMAL(7, 2),
        allowNull: true
      },
      overQuotaRate: {
        type: Sequelize.DECIMAL(7, 2),
        allowNull: true
      },
      fillRate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });

    // Create Forecasts table
    await queryInterface.createTable('forecasts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      hsCode: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: {
          model: 'hs_codes',
          key: 'code'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      predictedPrice: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      lowerBound: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      upperBound: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      confidenceScore: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'USD'
      },
      unit: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      horizon: {
        type: Sequelize.STRING(5),
        allowNull: false
      },
      modelVersion: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create Forecast Factors table
    await queryInterface.createTable('forecast_factors', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      forecastId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'forecasts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      impact: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('tariffs', ['hsCode', 'country', 'effectiveDate']);
    await queryInterface.addIndex('forecasts', ['hsCode', 'horizon', 'createdAt']);
    await queryInterface.addIndex('forecast_factors', ['forecastId']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order to handle dependencies
    await queryInterface.dropTable('forecast_factors');
    await queryInterface.dropTable('forecasts');
    await queryInterface.dropTable('tariff_quotas');
    await queryInterface.dropTable('tariff_special_programs');
    await queryInterface.dropTable('tariffs');
  }
};