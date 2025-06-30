process.env.DB_DIALECT = 'sqlite';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const { init, sequelize } = require('../src/models/sequelize');
const { Mnemonic, Wallet } = require('../src/models/sequelizeModels');

describe('Wallet API', () => {
  beforeAll(async () => {
    await init();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  test('create mnemonic', async () => {
    const res = await request(app)
      .post('/mnemonics')
      .send({ name: 'testmn' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('testmn');

    const count = await Mnemonic.count();
    expect(count).toBe(1);
  });

  test('list mnemonics', async () => {
    await Mnemonic.create({ name: 'm1' });
    await Mnemonic.create({ name: 'm2' });

    const res = await request(app).get('/mnemonics');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
  });

  const mnemonic = 'test test test test test test test test test test test junk';

  test('generate wallets', async () => {
    const res = await request(app)
      .post('/wallets')
      .send({ mnemonic, name: 'm1', count: 2 });
    expect(res.statusCode).toBe(200);
    expect(res.body.mnemonicName).toBe('m1');
    expect(res.body.wallets.length).toBe(2);

    const wCount = await Wallet.count();
    expect(wCount).toBe(2);
  });

  test('get wallets', async () => {
    await request(app)
      .post('/wallets')
      .send({ mnemonic, name: 'm1'});

    const res = await request(app)
      .post('/wallets/retrievePrivateKeys')
      .send({ mnemonic, mnemonicName: 'm1' });
      .send({ mnemonic, mnemonicName: 'm2' });
    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('wallet_index');
    expect(res.body[0]).toHaveProperty('address');
    expect(res.body[0]).toHaveProperty('privateKey');
  });
});
