'use strict';

module.exports = (sequelize, DataTypes) => {
  const Risk = sequelize.define('Risk', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM(
        'weather', 'political', 'economic', 'supply', 'demand', 'regulatory', 'other'
      ),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Risk type is required'
        }
      }
    },
    severity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
        notNull: {
          msg: 'Risk severity is required'
        }
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Risk title is required'
        },
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Risk description is required'
        },
        notEmpty: true
      }
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Source is required'
        },
        notEmpty: true
      }
    },
    sourceUrl: {
      type: DataTypes.STRING
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Start date is required'
        }
      }
    },
    endDate: {
      type: DataTypes.DATE
    },
    impactDirection: {
      type: DataTypes.ENUM('increase', 'decrease', 'volatile', 'stable', 'unknown'),
      defaultValue: 'unknown'
    },
    impactPercentage: {
      type: DataTypes.DECIMAL(5, 2)
    },
    impactConfidence: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: 100
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'risks',
    timestamps: true,
    updatedAt: 'updatedAt',
    createdAt: 'createdAt',
    indexes: [
      {
        fields: ['type']
      },
      {
        fields: ['isActive', 'severity']
      },
      {
        fields: ['startDate']
      }
    ]
  });

  // Association models
  Risk.associate = function(models) {
    // Risk affects many HS codes
    Risk.belongsToMany(models.HSCode, {
      through: 'risk_affected_hscodes',
      as: 'affectedHsCodes',
      foreignKey: 'riskId',
      otherKey: 'hsCode'
    });

    // Create model for affected regions (since it's an array in MongoDB)
    models.RiskRegion = sequelize.define('RiskRegion', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      riskId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'risks',
          key: 'id'
        }
      },
      region: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      tableName: 'risk_affected_regions',
      timestamps: false
    });

    // Create model for mitigation steps (since it's an array in MongoDB)
    models.RiskMitigation = sequelize.define('RiskMitigation', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      riskId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'risks',
          key: 'id'
        }
      },
      step: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    }, {
      tableName: 'risk_mitigation_steps',
      timestamps: false
    });

    // Define relationships
    Risk.hasMany(models.RiskRegion, {
      foreignKey: 'riskId',
      as: 'regions'
    });

    Risk.hasMany(models.RiskMitigation, {
      foreignKey: 'riskId',
      as: 'mitigationSteps'
    });
  };

  return Risk;
};