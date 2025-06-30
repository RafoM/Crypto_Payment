process.env.DB_DIALECT = 'sqlite';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const { init, sequelize } = require('../src/models/sequelize');
const { Blockchain, Crypto, PaymentMethod, Mnemonic, Wallet, WalletAssignment } = require('../src/models/sequelizeModels');

describe('Wallet Assignment API', () => {
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
    global.crypto = await Crypto.create({ name: 'Tether', symbol: 'USDT', status: 'active' });
    global.paymentMethod = await PaymentMethod.create({ blockchain_id: global.blockchain.id, crypto_id: global.crypto.id, status: 'active' });
    global.mnemonic = await Mnemonic.create({ name: 'm1' });
    global.wallet = await Wallet.create({
      mnemonic_id: global.mnemonic.id,
      payment_method_id: global.paymentMethod.id,
      wallet_index: 0,
      address: 'TXYZ',
      blockchain: 'tron',
    });
  });

  test('create wallet assignment', async () => {
    const res = await request(app)
      .post('/wallet-assignments')
      .send({ wallet_id: global.wallet.id, expected_amount: '1.5', description: 'desc' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');

    const count = await WalletAssignment.count();
    expect(count).toBe(1);
  });

  test('list wallet assignments', async () => {
    await WalletAssignment.create({ wallet_id: global.wallet.id });
    const res = await request(app).get('/wallet-assignments');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  test('get wallet assignment', async () => {
    const wa = await WalletAssignment.create({ wallet_id: global.wallet.id });
    const res = await request(app).get(`/wallet-assignments/${wa.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(wa.id);
  });

  test('update wallet assignment', async () => {
    const wa = await WalletAssignment.create({ wallet_id: global.wallet.id });
    const res = await request(app)
      .put(`/wallet-assignments/${wa.id}`)
      .send({ status: 'paid' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('paid');
  });

  test('delete wallet assignment', async () => {
    const wa = await WalletAssignment.create({ wallet_id: global.wallet.id });
    const res = await request(app).delete(`/wallet-assignments/${wa.id}`);
    expect(res.statusCode).toBe(200);
    const count = await WalletAssignment.count();
    expect(count).toBe(0);
  });

  test('request address and track assignment', async () => {
    const resReq = await request(app)
      .post('/wallet-assignments/request-address')
      .send({ blockchain: 'TRX', crypto: 'USDT', expected_amount: '2' });
    expect(resReq.statusCode).toBe(200);
    expect(resReq.body).toHaveProperty('wallet_address');

    const waCount = await WalletAssignment.count();
    expect(waCount).toBe(1);

    const trackRes = await request(app).get(`/wallet-assignments/track/${resReq.body.wallet_address}`);
    expect(trackRes.statusCode).toBe(200);
    expect(trackRes.body).toHaveProperty('status');
    expect(trackRes.body.status).toBe('assigned');
  });
});

