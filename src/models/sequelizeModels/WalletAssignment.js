const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../sequelize');
const Wallet = require('./Wallet');

const WalletAssignment = sequelize.define('WalletAssignment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  wallet_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Wallet, key: 'id' },
    onDelete: 'CASCADE',
  },
  status: {
    type: DataTypes.ENUM('assigned', 'paid', 'expired', 'cancelled'),
    defaultValue: 'assigned',
  },
  expected_amount: { type: DataTypes.DECIMAL, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  assigned_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  paid_at: { type: DataTypes.DATE, allowNull: true },
  expires_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'wallet_assignments',
  timestamps: true,
});

Wallet.hasMany(WalletAssignment, { foreignKey: 'wallet_id', onDelete: 'CASCADE' });
WalletAssignment.belongsTo(Wallet, { foreignKey: 'wallet_id', onDelete: 'CASCADE' });

module.exports = WalletAssignment;
