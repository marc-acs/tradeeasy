'use strict';

module.exports = (sequelize, DataTypes) => {
  const Price = sequelize.define('Price', {
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
          msg: 'Date is required'
        }
      }
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Price is required'
        }
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
      validate: {
        isIn: [['USD', 'EUR', 'ARS']]
      }
    },
    unit: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Unit is required'
        }
      }
    },
    source: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Source is required'
        }
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'prices',
    timestamps: true,
    indexes: [
      {
        fields: ['hsCode', 'date']
      }
    ],
    getterMethods: {
      formattedPrice() {
        return `${parseFloat(this.price).toFixed(2)} ${this.currency}/${this.unit}`;
      }
    }
  });

  Price.associate = function(models) {
    Price.belongsTo(models.HSCode, {
      foreignKey: 'hsCode',
      as: 'hsCodeData'
    });
  };

  return Price;
};