const express = require('express');
const { checkUser, checkUserInfo } = require('../../../middlewares/auth');
const router = express.Router();

router.get('/:userId', require('./userGET'));
router.get('/:userId/post/list', checkUserInfo, require('./userPostListGET'));
router.put('/', checkUser, require('./userPUT'));
router.delete('/', checkUser, require('./userDELETE'));

module.exports = router;
