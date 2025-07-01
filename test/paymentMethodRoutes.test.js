process.env.DB_DIALECT = 'sqlite';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const { init, sequelize } = require('../src/models/sequelize');
const { Blockchain, Crypto, PaymentMethod } = require('../src/models/sequelizeModels');

describe('Payment Method API', () => {
  beforeAll(async () => {
    await init();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    global.blockchain = await Blockchain.create({ name: 'TRON', symbol: 'TRX', wallet_generation_supported: true });
    global.crypto = await Crypto.create({ name: 'Tether', symbol: 'USDT' });
  });

  test('create payment method', async () => {
    const res = await request(app)
      .post('/payment-methods')
      .send({ blockchain_id: global.blockchain.id, crypto_id: global.crypto.id, status: 'active' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    const count = await PaymentMethod.count();
    expect(count).toBe(1);
  });

  test('list payment methods', async () => {
    await PaymentMethod.create({ blockchain_id: global.blockchain.id, crypto_id: global.crypto.id, status: 'active' });
    const res = await request(app).get('/payment-methods');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  test('get payment method', async () => {
    const pm = await PaymentMethod.create({ blockchain_id: global.blockchain.id, crypto_id: global.crypto.id, status: 'active' });
    const res = await request(app).get(`/payment-methods/${pm.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(pm.id);
  });

  test('update payment method', async () => {
    const pm = await PaymentMethod.create({ blockchain_id: global.blockchain.id, crypto_id: global.crypto.id, status: 'active' });
    const res = await request(app)
      .put(`/payment-methods/${pm.id}`)
      .send({ status: 'inactive' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('inactive');
  });

  test('delete payment method', async () => {
    const pm = await PaymentMethod.create({ blockchain_id: global.blockchain.id, crypto_id: global.crypto.id, status: 'active' });
    const res = await request(app).delete(`/payment-methods/${pm.id}`);
    expect(res.statusCode).toBe(200);
    const count = await PaymentMethod.count();
    expect(count).toBe(0);
  });

  test('list active payment methods', async () => {
    await PaymentMethod.create({ blockchain_id: global.blockchain.id, crypto_id: global.crypto.id, status: 'active' });
    const bc2 = await Blockchain.create({ name: 'ETH', symbol: 'ETH', wallet_generation_supported: false });
    const cr2 = await Crypto.create({ name: 'Ether', symbol: 'ETH' });
    await PaymentMethod.create({ blockchain_id: bc2.id, crypto_id: cr2.id, status: 'active' });

    const res = await request(app).get('/payment-methods/active');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  test('filter payment methods', async () => {
    const bc2 = await Blockchain.create({ name: 'ETH', symbol: 'ETH', wallet_generation_supported: true });
    const cr2 = await Crypto.create({ name: 'Ether', symbol: 'ETH' });

    await PaymentMethod.bulkCreate([
      { blockchain_id: global.blockchain.id, crypto_id: global.crypto.id, status: 'active' },
      { blockchain_id: bc2.id, crypto_id: cr2.id, status: 'inactive' },
    ]);

    const res = await request(app).get(`/admin/payment-methods/filters?blockchainId=${bc2.id}&status=inactive`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].blockchain_id).toBe(bc2.id);
    expect(res.body[0].status).toBe('inactive');
  });
});
