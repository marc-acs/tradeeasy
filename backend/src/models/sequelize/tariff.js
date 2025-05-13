'use strict';

module.exports = (sequelize, DataTypes) => {
  const Tariff = sequelize.define('Tariff', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    hsCode: {
      type: DataTypes.STRING(10),
      allowNull: false,
      references: {
        model: 'hs_codes',
        key: 'code'
      },
      validate: {
        notNull: {
          msg: 'HS code is required'
        }
      }
    },
    country: {
      type: DataTypes.STRING(3),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Country is required'
        }
      }
    },
    rate: {
      type: DataTypes.DECIMAL(7, 2),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Tariff rate is required'
        }
      }
    },
    unit: {
      type: DataTypes.ENUM('%', 'USD/kg', 'USD/unit'),
      defaultValue: '%'
    },
    effectiveDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    expirationDate: {
      type: DataTypes.DATE
    },
    source: {
      type: DataTypes.STRING(100)
    },
    sourceUrl: {
      type: DataTypes.STRING
    },
    notes: {
      type: DataTypes.TEXT
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'tariffs',
    timestamps: true,
    indexes: [
      {
        fields: ['hsCode', 'country', 'effectiveDate']
      }
    ]
  });

  // Special programs junction table
  Tariff.associate = function(models) {
    models.TariffSpecialProgram = sequelize.define('TariffSpecialProgram', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      tariffId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'tariffs',
          key: 'id'
        }
      },
      code: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      rate: {
        type: DataTypes.DECIMAL(7, 2),
        allowNull: false
      },
      notes: {
        type: DataTypes.TEXT
      }
    }, {
      tableName: 'tariff_special_programs',
      timestamps: false
    });

    // Quotas junction table
    models.TariffQuota = sequelize.define('TariffQuota', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      tariffId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'tariffs',
          key: 'id'
        }
      },
      quotaLimit: {
        type: DataTypes.DECIMAL(12, 2)
      },
      quotaUnit: {
        type: DataTypes.STRING(10)
      },
      withinQuotaRate: {
        type: DataTypes.DECIMAL(7, 2)
      },
      overQuotaRate: {
        type: DataTypes.DECIMAL(7, 2)
      },
      fillRate: {
        type: DataTypes.DECIMAL(5, 2)
      },
      notes: {
        type: DataTypes.TEXT
      }
    }, {
      tableName: 'tariff_quotas',
      timestamps: false
    });

    Tariff.belongsTo(models.HSCode, {
      foreignKey: 'hsCode',
      as: 'hsCodeData'
    });

    Tariff.hasMany(models.TariffSpecialProgram, {
      foreignKey: 'tariffId',
      as: 'specialPrograms'
    });

    Tariff.hasMany(models.TariffQuota, {
      foreignKey: 'tariffId',
      as: 'quotas'
    });
  };

  return Tariff;
};