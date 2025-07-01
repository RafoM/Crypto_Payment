const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;
if (process.env.DB_DIALECT === 'sqlite') {
  sequelize = new Sequelize('sqlite::memory:', { logging: false });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME ,
    process.env.DB_USER ,
    process.env.DB_PASS ,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: false,
    }
  );
}

async function init() {
    console.log('[DEBUG ENV] DB_USER:', process.env.DB_USER);
  if (process.env.NODE_ENV !== 'production') {
    await sequelize.sync({ alter: true });
  }
}

module.exports = { sequelize, init };
