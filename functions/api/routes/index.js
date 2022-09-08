const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/user', require('./user'));
router.use('/post', require('./post'));
router.use('/subscribe', require('./subscribe'));
router.use('/payment', require('./payment'));
router.use('/inference', require('./inference'));

module.exports = router;
