const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/list', checkUser, require('./paymentListGET'));
router.get('/', checkUser, require('./paymentGET'));

module.exports = router;
