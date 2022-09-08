const express = require('express');
const { checkUser, checkUserInfo } = require('../../../middlewares/auth');
const { uploadImage, uploadWeight } = require('../../../middlewares/uploadFile');
const router = express.Router();

router.post('/', checkUser, uploadImage.single('thumbnail'), require('./postPOST'));
router.post('/weight', checkUser, uploadWeight.single('weight'), require('./postWeightPOST'));
router.put('/weight', checkUser, uploadWeight.single('weight'), require('./postWeightPUT'));
router.get('/list', checkUserInfo, require('./postListGET'));
router.get('/:postId', checkUserInfo, require('./postGET'));
router.put('/:postId', checkUser, uploadImage.single('thumbnail'), require('./postPUT'));
router.delete('/:postId', checkUser, require('./postDELETE'));
// router.post('/tagSearch', require('./postTagSearchPOST'));

module.exports = router;
