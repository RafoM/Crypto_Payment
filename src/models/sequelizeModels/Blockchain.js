const { DataTypes } = require('sequelize');
const { sequelize } = require('../sequelize');

const Blockchain = sequelize.define('Blockchain', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  symbol: { type: DataTypes.STRING, allowNull: false },
  image_url: DataTypes.STRING,
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  wallet_generation_supported: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'blockchains',
  timestamps: false,
});

module.exports = Blockchain;
