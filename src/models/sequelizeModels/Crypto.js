const { DataTypes } = require('sequelize');
const { sequelize } = require('../sequelize');

const Crypto = sequelize.define('Crypto', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  symbol: { type: DataTypes.STRING, allowNull: false },
  image_url: DataTypes.STRING,
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
}, {
  tableName: 'cryptos',
  timestamps: false,
});

module.exports = Crypto;
