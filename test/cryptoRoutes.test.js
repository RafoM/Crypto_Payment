process.env.DB_DIALECT = 'sqlite';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const { init, sequelize } = require('../src/models/sequelize');
const { Crypto } = require('../src/models/sequelizeModels');

describe('Crypto API', () => {
  beforeAll(async () => {
    await init();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  test('create crypto', async () => {
    const res = await request(app)
      .post('/cryptos')
      .send({ name: 'Tether', symbol: 'USDT' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    const count = await Crypto.count();
    expect(count).toBe(1);
  });

  test('list cryptos', async () => {
    await Crypto.create({ name: 'Tether', symbol: 'USDT' });
    await Crypto.create({ name: 'Ether', symbol: 'ETH' });

    const res = await request(app).get('/cryptos');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  test('get crypto', async () => {
    const cr = await Crypto.create({ name: 'Tether', symbol: 'USDT' });
    const res = await request(app).get(`/cryptos/${cr.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(cr.id);
  });

  test('update crypto', async () => {
    const cr = await Crypto.create({ name: 'Tether', symbol: 'USDT' });
    const res = await request(app)
      .put(`/cryptos/${cr.id}`)
      .send({ symbol: 'USDT2' });
    expect(res.statusCode).toBe(200);
    expect(res.body.symbol).toBe('USDT2');
  });

  test('delete crypto', async () => {
    const cr = await Crypto.create({ name: 'Tether', symbol: 'USDT' });
    const res = await request(app).delete(`/cryptos/${cr.id}`);
    expect(res.statusCode).toBe(200);
    const count = await Crypto.count();
    expect(count).toBe(0);
  });
});
