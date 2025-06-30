const { Sequelize } = require('sequelize');

let sequelize;
if (process.env.DB_DIALECT === 'sqlite') {
  sequelize = new Sequelize('sqlite::memory:', { logging: false });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'wallets_db',
    process.env.DB_USER || 'myuser',
    process.env.DB_PASS || 'mysecret',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql',
      logging: false,
    }
  );
}

async function init() {
  if (process.env.NODE_ENV !== 'production') {
    await sequelize.sync({ alter: true });
  }
}

module.exports = { sequelize, init };
