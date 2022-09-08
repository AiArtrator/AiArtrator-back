const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const router = express.Router();

router.post('/', checkUser, require('./inferencePOST'));
router.get('/list/post/:postId', checkUser, require('./inferenceListGET'));

module.exports = router;
