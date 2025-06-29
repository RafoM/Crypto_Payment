const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

router.post('/mnemonics', walletController.createMnemonic);
router.post('/wallets/:mnemonicName', walletController.getWallets);


module.exports = router;
