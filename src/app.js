const express = require('express');
const cors = require('cors');
const walletRoutes = require('./routes/walletRoutes');
const mnemonicRoutes = require('./routes/mnemonicRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const cryptoRoutes = require('./routes/cryptoRoutes');
const paymentMethodRoutes = require('./routes/paymentMethodRoutes');
const walletAssignmentRoutes = require('./routes/walletAssignmentRoutes');

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use('/', walletRoutes);
app.use('/mnemonics', mnemonicRoutes);
app.use('/blockchains', blockchainRoutes);
app.use('/cryptos', cryptoRoutes);
app.use('/payment-methods', paymentMethodRoutes);
app.use('/wallet-assignments', walletAssignmentRoutes);

module.exports = app;
