const { DataTypes } = require('sequelize');
const { sequelize } = require('../sequelize');
const Mnemonic = require('./Mnemonic');
const PaymentMethod = require('./PaymentMethod');

const Wallet = sequelize.define('Wallet', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  mnemonic_id: {
    type: DataTypes.INTEGER,
    references: { model: Mnemonic, key: 'id' },
  },
  payment_method_id: {
    type: DataTypes.INTEGER,
    references: { model: PaymentMethod, key: 'id' },
    allowNull: false,
  },
  blockchain: DataTypes.STRING,
  wallet_index: DataTypes.INTEGER,
  address: DataTypes.STRING,
}, {
  tableName: 'wallets',
  timestamps: false,
});

Mnemonic.hasMany(Wallet, { foreignKey: 'mnemonic_id' });
Wallet.belongsTo(Mnemonic, { foreignKey: 'mnemonic_id' });
PaymentMethod.hasMany(Wallet, { foreignKey: 'payment_method_id' });
Wallet.belongsTo(PaymentMethod, { foreignKey: 'payment_method_id' });

module.exports = Wallet;
