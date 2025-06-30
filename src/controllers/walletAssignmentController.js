const { Op } = require('sequelize');
const { Wallet, WalletAssignment, PaymentMethod, Blockchain, Crypto } = require('../models/sequelizeModels');

async function expireOldAssignments() {
  await WalletAssignment.update(
    { status: 'expired' },
    {
      where: {
        status: 'assigned',
        expires_at: { [Op.lt]: new Date() },
      },
    }
  );
}

async function list(_req, res) {
  await expireOldAssignments();
  const rows = await WalletAssignment.findAll({ order: [['id', 'ASC']] });
  res.json(rows);
}

async function get(req, res) {
  await expireOldAssignments();
  const row = await WalletAssignment.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
}

async function create(req, res) {
  try {
    const row = await WalletAssignment.create(req.body);
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid data' });
  }
}

async function update(req, res) {
  const row = await WalletAssignment.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  try {
    await row.update(req.body);
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid data' });
  }
}

async function remove(req, res) {
  const row = await WalletAssignment.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  await row.destroy();
  res.json({});
}

async function requestAddress(req, res) {
  const { blockchain, crypto, expected_amount, description } = req.body;
  if (!blockchain || !crypto) {
    return res.status(400).json({ error: 'blockchain and crypto are required' });
  }

  await expireOldAssignments();

  const pm = await PaymentMethod.findOne({
    where: { status: 'active' },
    include: [{ model: Blockchain, where: { symbol: blockchain } }, { model: Crypto, where: { symbol: crypto } }],
  });
  if (!pm) {
    return res.status(404).json({ error: 'Payment method not found' });
  }

  // find unused wallet
  const wallets = await Wallet.findAll({ where: { payment_method_id: pm.id }, include: [WalletAssignment] });
  let walletRow;
  for (const w of wallets) {
    const activeAssignment = w.WalletAssignments.find(a => ['assigned', 'paid'].includes(a.status) && (!a.expires_at || a.expires_at > new Date()));
    if (!activeAssignment) {
      walletRow = w;
      break;
    }
  }

  if (!walletRow) {
    return res.status(404).json({ error: 'No available wallet' });
  }

  // Create assignment
  const expireTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour default expiry
  try {
    const assignment = await WalletAssignment.create({
      wallet_id: walletRow.id,
      expected_amount,
      description,
      expires_at: expireTime,
    });
    res.json({ wallet_address: walletRow.address, expires_at: assignment.expires_at, expected_amount: assignment.expected_amount });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid data' });
  }
}

async function track(req, res) {
  await expireOldAssignments();
  const walletAddress = req.params.walletAddress;
  const wallet = await Wallet.findOne({ where: { address: walletAddress }, include: [WalletAssignment] });
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
  const assignment = wallet.WalletAssignments.sort((a,b)=>b.id-a.id)[0];
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  res.json({
    status: assignment.status,
    assigned_at: assignment.assigned_at,
    paid_at: assignment.paid_at,
    expires_at: assignment.expires_at,
  });
}

module.exports = { list, get, create, update, remove, requestAddress, track };
