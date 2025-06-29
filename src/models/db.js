const mysql = require('mysql2/promise');

async function init() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'myuser',
    password: process.env.DB_PASS || 'mysecret',
    database: process.env.DB_NAME || 'wallets_db'
  });

  await connection.execute(`CREATE TABLE IF NOT EXISTS mnemonics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
  )`);
  await connection.execute(`CREATE TABLE IF NOT EXISTS wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mnemonic_id INT,
    wallet_index INT,
    address VARCHAR(64),
    UNIQUE KEY uniq_wallet (mnemonic_id, wallet_index),
    FOREIGN KEY (mnemonic_id) REFERENCES mnemonics(id)
  )`);
  return connection;
}

module.exports = { init };
