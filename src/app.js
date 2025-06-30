const express = require('express');
const walletRoutes = require('./routes/walletRoutes');
const mnemonicRoutes = require('./routes/mnemonicRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const cryptoRoutes = require('./routes/cryptoRoutes');
const paymentMethodRoutes = require('./routes/paymentMethodRoutes');

const app = express();
app.use(express.json());
app.use('/', walletRoutes);
app.use('/mnemonics', mnemonicRoutes);
app.use('/blockchains', blockchainRoutes);
app.use('/cryptos', cryptoRoutes);
app.use('/payment-methods', paymentMethodRoutes);

module.exports = app;
