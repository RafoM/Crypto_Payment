const { deriveAddresses, deriveWallet } = require('../models/wallet');
const { Mnemonic, Wallet, PaymentMethod, Blockchain, Crypto } = require('../models/sequelizeModels');

async function generateWallets(req, res) {
  const { mnemonic, name, count, paymentMethodId } = req.body;
  const cnt = parseInt(count, 10) || 1;

  if (!mnemonic || !name || !paymentMethodId) {
    return res.status(400).json({ error: 'mnemonic, name and paymentMethodId are required' });
  }

  try {
    const [mnemonicRow] = await Mnemonic.findOrCreate({ where: { name } });
    const pm = await PaymentMethod.findByPk(paymentMethodId);
    if (!pm) {
      return res.status(400).json({ error: 'invalid paymentMethodId' });
    }
    const wallets = deriveAddresses(mnemonic, cnt);

    for (const w of wallets) {
      await Wallet.findOrCreate({
        where: { mnemonic_id: mnemonicRow.id, wallet_index: w.index },
        defaults: { address: w.address, payment_method_id: paymentMethodId },
      });
    }

    res.json({
      mnemonicName: name,
      paymentMethodId,
      wallets: wallets.map(w => ({ wallet_index: w.index, address: w.address })),
    });
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

async function listWallets(_req, res) {
  try {
    const wallets = await Wallet.findAll({
      include: [{
        model: PaymentMethod,
        include: [Blockchain, Crypto],
      }],
      order: [['id', 'ASC']],
    });
    const result = wallets.map(w => ({
      id: w.id,
      mnemonic_id: w.mnemonic_id,
      wallet_index: w.wallet_index,
      address: w.address,
      blockchain: w.PaymentMethod?.Blockchain?.symbol,
      crypto: w.PaymentMethod?.Crypto?.symbol,
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getWallets(req, res) {
  const { mnemonic, mnemonicName } = req.body;

  if (!mnemonic) {
    return res.status(400).json({ error: 'mnemonic is required' });
  }

  try {
    const mRow = await Mnemonic.findOne({ where: { name: mnemonicName } });
    if (!mRow) {
      return res.json([]);
    }
    const walletRows = await Wallet.findAll({
      where: { mnemonic_id: mRow.id },
      order: [['wallet_index', 'ASC']],
      attributes: ['wallet_index'],
    });

    const result = walletRows.map(r => deriveWallet(mnemonic, r.wallet_index));

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
  listWallets,
};


