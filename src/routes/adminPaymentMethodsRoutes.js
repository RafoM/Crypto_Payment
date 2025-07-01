const express = require('express');
const controller = require('../controllers/paymentMethodController');
const router = express.Router();

router.get('/payment-methods/filters', controller.listFiltered);

module.exports = router;
