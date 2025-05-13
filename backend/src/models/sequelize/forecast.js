'use strict';

module.exports = (sequelize, DataTypes) => {
  const Forecast = sequelize.define('Forecast', {
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
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Forecast date is required'
        }
      }
    },
    predictedPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Predicted price is required'
        }
      }
    },
    lowerBound: {
      type: DataTypes.DECIMAL(12, 2)
    },
    upperBound: {
      type: DataTypes.DECIMAL(12, 2)
    },
    confidenceScore: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: 100
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    unit: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    horizon: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        isIn: {
          args: [['1d', '1w', '1m', '3m', '6m', '1y']],
          msg: 'Invalid forecast horizon'
        }
      }
    },
    modelVersion: {
      type: DataTypes.STRING(20)
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'forecasts',
    timestamps: true,
    indexes: [
      {
        fields: ['hsCode', 'horizon', 'createdAt']
      }
    ]
  });

  Forecast.associate = function(models) {
    // Forecast factors junction table
    models.ForecastFactor = sequelize.define('ForecastFactor', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      forecastId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'forecasts',
          key: 'id'
        }
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      impact: {
        type: DataTypes.DECIMAL(4, 2)
      },
      description: {
        type: DataTypes.TEXT
      }
    }, {
      tableName: 'forecast_factors',
      timestamps: false
    });

    Forecast.belongsTo(models.HSCode, {
      foreignKey: 'hsCode',
      as: 'hsCodeData'
    });

    Forecast.hasMany(models.ForecastFactor, {
      foreignKey: 'forecastId',
      as: 'factors'
    });
  };

  return Forecast;
};