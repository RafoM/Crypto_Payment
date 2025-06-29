const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

router.post('/', walletController.generateWallets);

module.exports = router;
