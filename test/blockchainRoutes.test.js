process.env.DB_DIALECT = 'sqlite';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const { init, sequelize } = require('../src/models/sequelize');
const { Blockchain } = require('../src/models/sequelizeModels');

describe('Blockchain API', () => {
  beforeAll(async () => {
    await init();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  test('create blockchain', async () => {
    const res = await request(app)
      .post('/blockchains')
      .send({ name: 'TRON', symbol: 'TRX', wallet_generation_supported: true });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    const count = await Blockchain.count();
    expect(count).toBe(1);
  });

  test('list blockchains', async () => {
    await Blockchain.create({ name: 'TRON', symbol: 'TRX' });
    await Blockchain.create({ name: 'ETHEREUM', symbol: 'ETH' });

    const res = await request(app).get('/blockchains');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  test('get blockchain', async () => {
    const bc = await Blockchain.create({ name: 'TRON', symbol: 'TRX' });
    const res = await request(app).get(`/blockchains/${bc.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(bc.id);
  });

  test('update blockchain', async () => {
    const bc = await Blockchain.create({ name: 'TRON', symbol: 'TRX' });
    const res = await request(app)
      .put(`/blockchains/${bc.id}`)
      .send({ symbol: 'TRX2' });
    expect(res.statusCode).toBe(200);
    expect(res.body.symbol).toBe('TRX2');
  });

  test('delete blockchain', async () => {
    const bc = await Blockchain.create({ name: 'TRON', symbol: 'TRX' });
    const res = await request(app).delete(`/blockchains/${bc.id}`);
    expect(res.statusCode).toBe(200);
    const count = await Blockchain.count();
    expect(count).toBe(0);
  });
});
