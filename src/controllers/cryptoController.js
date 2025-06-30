const { Crypto } = require('../models/sequelizeModels');

async function list(req, res) {
  const rows = await Crypto.findAll({ order: [['id', 'ASC']] });
  res.json(rows);
}

async function get(req, res) {
  const row = await Crypto.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
}

async function create(req, res) {
  try {
    const row = await Crypto.create(req.body);
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid data' });
  }
}

async function update(req, res) {
  const row = await Crypto.findByPk(req.params.id);
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
  const row = await Crypto.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  await row.destroy();
  res.json({});
}

module.exports = { list, get, create, update, remove };
