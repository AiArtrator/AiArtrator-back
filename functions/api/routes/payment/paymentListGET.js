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

    const paymentList = await paymentDB.getPaymentListByUserId(client, req.user.id);

    // 가장 최근 토큰 조회
    const currentToken = paymentList.length !== 0 ? paymentList[paymentList.length - 1].balance : 0;

    res.status(statusCode.OK).send(
      util.success(statusCode.OK, responseMessage.READ_ALL_PAYMENTS_SUCCESS, {
        currentToken: {
          userNickname: req.user.nickname,
          currentToken: currentToken,
        },
        paymentList,
      }),
    );
  } catch (error) {
    errorHandlers.error(req, error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
