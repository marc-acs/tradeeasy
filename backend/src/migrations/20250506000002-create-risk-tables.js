'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Risks table
    await queryInterface.createTable('risks', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      type: {
        type: Sequelize.ENUM(
          'weather', 'political', 'economic', 'supply', 'demand', 'regulatory', 'other'
        ),
        allowNull: false
      },
      severity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      source: {
        type: Sequelize.STRING,
        allowNull: false
      },
      sourceUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      impactDirection: {
        type: Sequelize.ENUM('increase', 'decrease', 'volatile', 'stable', 'unknown'),
        defaultValue: 'unknown'
      },
      impactPercentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      impactConfidence: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    // Create Risk Affected HS Codes junction table
    await queryInterface.createTable('risk_affected_hscodes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      riskId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'risks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // Create Risk Affected Regions table
    await queryInterface.createTable('risk_affected_regions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      riskId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'risks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      region: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });

    // Create Risk Mitigation Steps table
    await queryInterface.createTable('risk_mitigation_steps', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      riskId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'risks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      step: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    });

    // Add indexes
    await queryInterface.addIndex('risks', ['isActive', 'severity']);
    await queryInterface.addIndex('risks', ['startDate']);
    await queryInterface.addIndex('risks', ['type']);
    await queryInterface.addIndex('risk_affected_hscodes', ['riskId', 'hsCode'], {
      unique: true
    });
    await queryInterface.addIndex('risk_affected_regions', ['riskId', 'region']);
    await queryInterface.addIndex('risk_mitigation_steps', ['riskId', 'order']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order to handle dependencies
    await queryInterface.dropTable('risk_mitigation_steps');
    await queryInterface.dropTable('risk_affected_regions');
    await queryInterface.dropTable('risk_affected_hscodes');
    await queryInterface.dropTable('risks');
  }
};