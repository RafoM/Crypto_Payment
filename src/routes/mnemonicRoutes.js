const express = require('express');
const controller = require('../controllers/mnemonicController');
const router = express.Router();

router.post('/', controller.createMnemonicName);
router.get('/', controller.listMnemonics);

module.exports = router;
