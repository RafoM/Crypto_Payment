process.env.DB_DIALECT = 'sqlite';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const { init, sequelize } = require('../src/models/sequelize');
const { Mnemonic, Wallet, Blockchain, Crypto, PaymentMethod } = require('../src/models/sequelizeModels');

describe('Wallet API', () => {
  beforeAll(async () => {
    await init();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    global.blockchain = await Blockchain.create({
      name: 'TRON',
      symbol: 'TRX',
      wallet_generation_supported: true,
      status: 'active',
    });
    global.crypto = await Crypto.create({
      name: 'Tether',
      symbol: 'USDT',
      status: 'active',
    });
    global.paymentMethod = await PaymentMethod.create({
      blockchain_id: global.blockchain.id,
      crypto_id: global.crypto.id,
      status: 'active',
    });
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
      .post('/generate-wallets')
      .send({ blockchain: 'tron', mnemonic, name: 'm1', count: 2, paymentMethodId: global.paymentMethod.id });
    expect(res.statusCode).toBe(200);
    expect(res.body.mnemonicName).toBe('m1');
    expect(res.body.wallets.length).toBe(2);

    const wCount = await Wallet.count();
    expect(wCount).toBe(2);
  });

  test('get wallets', async () => {
    await request(app)
      .post('/generate-wallets')
      .send({ blockchain: 'tron', mnemonic, name: 'm1', count: 2, paymentMethodId: global.paymentMethod.id });

    const res = await request(app)
      .post('/wallets/retrievePrivateKeys')
      .send({ mnemonic, mnemonicName: 'm1' });
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('wallet_index');
    expect(res.body[0]).toHaveProperty('address');
    expect(res.body[0]).toHaveProperty('privateKey');
  });
});
