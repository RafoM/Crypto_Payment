const bip39 = require('bip39');
const { init } = require('../models/db');
const { deriveAddresses } = require('../models/wallet');

async function generateWallets(req, res) {
  const count = parseInt(req.body.count, 10) || 1;
  const mnemonic = req.body.mnemonic || bip39.generateMnemonic();

  try {
    const connection = await init();
    const [insert] = await connection.execute(
      'INSERT IGNORE INTO mnemonics (phrase) VALUES (?)',
      [mnemonic]
    );
    let mnemonicId = insert.insertId;
    if (!mnemonicId) {
      const [rows] = await connection.execute(
        'SELECT id FROM mnemonics WHERE phrase=?',
        [mnemonic]
      );
      mnemonicId = rows[0].id;
    }

    const wallets = deriveAddresses(mnemonic, count);

    for (const w of wallets) {
      await connection.execute(
        'INSERT INTO wallets (mnemonic_id, wallet_index, address, private_key) VALUES (?, ?, ?, ?)',
        [mnemonicId, w.index, w.address, w.privateKey]
      );
    }

    await connection.end();
    res.json({ mnemonic, wallets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { generateWallets };
