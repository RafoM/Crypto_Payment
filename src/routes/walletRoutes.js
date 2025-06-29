const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

router.post('/mnemonics', walletController.createMnemonicName);
router.get('/mnemonics', walletController.listMnemonics);
router.post('/wallets', walletController.generateWallets);
router.post('/wallets/:mnemonicName', walletController.getWallets);


module.exports = router;
