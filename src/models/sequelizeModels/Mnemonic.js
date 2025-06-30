const { DataTypes } = require('sequelize');
const { sequelize } = require('../sequelize');

const Mnemonic = sequelize.define('Mnemonic', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
}, {
  tableName: 'mnemonics',
  timestamps: false,
});

module.exports = Mnemonic;
