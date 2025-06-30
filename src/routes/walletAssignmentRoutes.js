const express = require('express');
const router = express.Router();
const controller = require('../controllers/walletAssignmentController');

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

router.post('/request-address', controller.requestAddress);
router.get('/track/:walletAddress', controller.track);

module.exports = router;
