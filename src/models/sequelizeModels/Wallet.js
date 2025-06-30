const { DataTypes } = require('sequelize');
const { sequelize } = require('../sequelize');
const Mnemonic = require('./Mnemonic');

const Wallet = sequelize.define('Wallet', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  mnemonic_id: {
    type: DataTypes.INTEGER,
    references: { model: Mnemonic, key: 'id' },
  },
  wallet_index: DataTypes.INTEGER,
  address: DataTypes.STRING,
}, {
  tableName: 'wallets',
  timestamps: false,
});

Mnemonic.hasMany(Wallet, { foreignKey: 'mnemonic_id' });
Wallet.belongsTo(Mnemonic, { foreignKey: 'mnemonic_id' });

module.exports = Wallet;
