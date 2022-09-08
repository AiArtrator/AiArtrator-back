const _ = require('lodash');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { paymentDB } = require('../../../db');
const errorHandlers = require('../../../lib/errorHandlers');

module.exports = async (req, res) => {
  let client;

  try {
    client = await db.connect(req);

    const payment = await paymentDB.getPaymentByUserId(client, req.user.id);

    const balance = payment ? payment.balance : 0;

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ONE_PAYMENT_SUCCESS, balance));
  } catch (error) {
    errorHandlers.error(req, error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
