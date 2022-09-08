const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.post('/check/email', require('./authCheckEmailPOST'));
router.post('/check/nickname', require('./authCheckNicknamePOST'));
router.post('/check/phone', require('./authCheckPhonePOST'));
router.post('/signup', require('./authSignupPOST'));
router.post('/login/email', require('./authLoginEmailPOST'));
router.post('/logout', checkUser, require('./authLogoutPOST'));

module.exports = router;
