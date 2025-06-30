const express = require('express');
const controller = require('../controllers/paymentMethodController');
const router = express.Router();

router.get('/', controller.list);
router.get('/active', controller.listActive);
router.get('/:id', controller.get);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
