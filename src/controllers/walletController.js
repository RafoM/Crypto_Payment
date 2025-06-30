const { deriveAddresses, deriveWallet } = require('../models/wallet');
const { Mnemonic, Wallet } = require('../models/sequelizeModels');

async function generateWallets(req, res) {
  const { mnemonic, name, count } = req.body;
  const cnt = parseInt(count, 10) || 1;

  if (!mnemonic || !name) {
    return res.status(400).json({ error: 'mnemonic and name are required' });
  }

  try {
    const [mnemonicRow] = await Mnemonic.findOrCreate({ where: { name } });
    const wallets = deriveAddresses(mnemonic, cnt);

    for (const w of wallets) {
      await Wallet.findOrCreate({
        where: { mnemonic_id: mnemonicRow.id, wallet_index: w.index },
        defaults: { address: w.address },
      });
    }

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
    const [row] = await Mnemonic.findOrCreate({ where: { name } });
    res.json({ id: row.id, name: row.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function listMnemonics(_req, res) {
  try {
    const rows = await Mnemonic.findAll({ order: [['id', 'ASC']], attributes: ['id', 'name'] });
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
    const [mRow] = await Mnemonic.findOrCreate({ where: { name: mnemonicName } });
    const walletRows = await Wallet.findAll({
      where: { mnemonic_id: mRow.id },
      order: [['wallet_index', 'ASC']],
      attributes: ['wallet_index'],
    });

    const result = walletRows.map(r => deriveWallet(mnemonic, r.wallet_index));
    console.log(result, '1111111');
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


