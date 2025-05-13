'use strict';

module.exports = (sequelize, DataTypes) => {
  const HSCode = sequelize.define('HSCode', {
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
      validate: {
        is: /^\d{6,10}$/,
        notNull: {
          msg: 'HS code is required'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        notNull: {
          msg: 'Description is required'
        }
      }
    },
    section: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    chapter: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    searchCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'hs_codes',
    timestamps: true,
    indexes: [
      {
        fields: ['description']
      }
    ]
  });

  HSCode.associate = function(models) {
    HSCode.hasMany(models.Price, {
      foreignKey: 'hsCode',
      as: 'prices'
    });
    // Other associations as needed
  };

  return HSCode;
};