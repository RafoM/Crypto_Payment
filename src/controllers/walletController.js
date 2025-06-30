const { init } = require('../models/db');
const { deriveAddresses, deriveWallet } = require('../models/wallet');

async function generateWallets(req, res) {
  const { mnemonic, name, count } = req.body;
  const cnt = parseInt(count, 10) || 1;

  if (!mnemonic || !name) {
    return res.status(400).json({ error: 'mnemonic and name are required' });
  }

  try {
    const connection = await init();
    const [ins] = await connection.execute(
      'INSERT IGNORE INTO mnemonics (name) VALUES (?)',
      [name]
    );
    let mnemonicId = ins.insertId;
    if (!mnemonicId) {
      const [rows] = await connection.execute(
        'SELECT id FROM mnemonics WHERE name=?',
        [name]
      );
      mnemonicId = rows[0].id;
    }

    const wallets = deriveAddresses(mnemonic, cnt);

    for (const w of wallets) {
      await connection.execute(
        'INSERT IGNORE INTO wallets (mnemonic_id, wallet_index, address) VALUES (?, ?, ?)',
        [mnemonicId, w.index, w.address]
      );
    }

    await connection.end();
    res.json({ mnemonicName: name, wallets: wallets.map(w => ({ wallet_index: w.index, address: w.address })) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createMnemonicName(req, res) {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  try {
    const connection = await init();
    await connection.execute('INSERT IGNORE INTO mnemonics (name) VALUES (?)', [name]);
    const [rows] = await connection.execute('SELECT id, name FROM mnemonics WHERE name=?', [name]);
    await connection.end();
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function listMnemonics(req, res) {
  try {
    const connection = await init();
    const [rows] = await connection.execute('SELECT id, name FROM mnemonics ORDER BY id');
    await connection.end();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getWallets(req, res) {
  const { mnemonic, mnemonicName } = req.body;
  console.log(req.body, 111111);
  if (!mnemonic) {
    return res.status(400).json({ error: 'mnemonic is required' });
  }

  try {
    const connection = await init();
    const [ins] = await connection.execute(
      'INSERT IGNORE INTO mnemonics (name) VALUES (?)',
      [mnemonicName]
    );
    let mnemonicId = ins.insertId;
    if (!mnemonicId) {
      const [rows] = await connection.execute('SELECT id FROM mnemonics WHERE name=?', [mnemonicName]);
      if (rows.length === 0) {
        await connection.end();
        return res.json([]);
      }
      mnemonicId = rows[0].id;
    }

    const [walletRows] = await connection.execute(
      'SELECT wallet_index FROM wallets WHERE mnemonic_id=? ORDER BY wallet_index',
      [mnemonicId]
    );

    const result = walletRows.map(r => deriveWallet(mnemonic, r.wallet_index));
    await connection.end();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  generateWallets,
  getWallets,
  createMnemonicName,
  listMnemonics,
};


