const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');
const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');

dotenv.config();

const weightFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/octet-stream') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const uploadWeight = multer({
  storage: multerS3({
    s3: new AWS.S3({ accessKeyId: process.env.S3_ACCESS_KEY, secretAccessKey: process.env.S3_SECRET_KEY, region: process.env.S3_REGION }),
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const uuid = uuidv4();
      const fileName = uuid + path.extname(file.originalname);
      cb(null, fileName);
    },
  }),
  fileFilter: weightFileFilter,
});

const uploadImage = multer({
  storage: multerS3({
    s3: new AWS.S3({ accessKeyId: process.env.S3_ACCESS_KEY, secretAccessKey: process.env.S3_SECRET_KEY, region: process.env.S3_REGION }),
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const uuid = uuidv4();
      const fileName = `images/post/thumbnail/${dayjs().format('YYYYMMDD_')}${uuid}` + path.extname(file.originalname);
      cb(null, fileName);
    },
  }),
  fileFilter: imageFileFilter,
});

module.exports = { uploadImage, uploadWeight };
