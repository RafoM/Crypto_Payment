const { DataTypes } = require('sequelize');
const { sequelize } = require('../sequelize');
const Blockchain = require('./Blockchain');
const Crypto = require('./Crypto');

const PaymentMethod = sequelize.define('PaymentMethod', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  blockchain_id: {
    type: DataTypes.INTEGER,
    references: { model: Blockchain, key: 'id' },
    allowNull: false,
  },
  crypto_id: {
    type: DataTypes.INTEGER,
    references: { model: Crypto, key: 'id' },
    allowNull: false,
  },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
}, {
  tableName: 'payment_methods',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['blockchain_id', 'crypto_id'] },
  ],
});

Blockchain.hasMany(PaymentMethod, { foreignKey: 'blockchain_id' });
PaymentMethod.belongsTo(Blockchain, { foreignKey: 'blockchain_id' });
Crypto.hasMany(PaymentMethod, { foreignKey: 'crypto_id' });
PaymentMethod.belongsTo(Crypto, { foreignKey: 'crypto_id' });

module.exports = PaymentMethod;
