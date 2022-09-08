const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const hpp = require('hpp');
const helmet = require('helmet');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const util = require('../lib/util');
const admin = require('firebase-admin');
const serviceAccount = require('../p-o-g-cf552-firebase-adminsdk-lmexc-c3690468c6');

// secret keys
dotenv.config();

const app = express();

// Cross-Origin Resource Sharing
app.use(cors());

//  for security
if (process.env.NODE_ENV === 'production') {
  app.use(hpp());
  app.use(helmet());
}

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// extend limit
app.use(bodyParser.json({ limit: '200mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true, parameterLimit: '200000' }));

app.use(cookieParser());

// routing
app.use('/api', require('./routes'));

// catch 404
app.use('*', (req, res) => {
  res.status(404).send(util.fail(404, '잘못된 경로입니다.'));
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = app;
