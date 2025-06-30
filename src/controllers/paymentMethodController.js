const { PaymentMethod, Blockchain, Crypto } = require('../models/sequelizeModels');

async function list(req, res) {
  const rows = await PaymentMethod.findAll({ include: [Blockchain, Crypto], order: [['id', 'ASC']] });
  res.json(rows);
}

async function get(req, res) {
  const row = await PaymentMethod.findByPk(req.params.id, { include: [Blockchain, Crypto] });
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
}

async function create(req, res) {
  try {
    const [row, created] = await PaymentMethod.findOrCreate({
      where: { blockchain_id: req.body.blockchain_id, crypto_id: req.body.crypto_id },
      defaults: req.body,
    });
    if (!created) return res.status(400).json({ error: 'Duplicate payment method' });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid data' });
  }
}

async function update(req, res) {
  const row = await PaymentMethod.findByPk(req.params.id);
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
  const row = await PaymentMethod.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  await row.destroy();
  res.json({});
}

async function listActive(req, res) {
  const rows = await PaymentMethod.findAll({
    where: { status: 'active' },
    include: [{
      model: Blockchain,
      where: { wallet_generation_supported: true },
    }, Crypto],
  });
  res.json(rows);
}

module.exports = { list, get, create, update, remove, listActive };
