const { Mnemonic } = require('../models/sequelizeModels');

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

module.exports = { createMnemonicName, listMnemonics };
