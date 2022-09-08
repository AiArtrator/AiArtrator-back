const _ = require('lodash');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { subscribeDB } = require('../../../db');
const errorHandlers = require('../../../lib/errorHandlers');

module.exports = async (req, res) => {
  const { postId } = req.body;

  if (!postId) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    let subscribe = await subscribeDB.updateSubscribe(client, req.user.id, postId);
    subscribe = { id: subscribe.id, userId: subscribe.userId, postId: subscribe.postId, createdAt: subscribe.createdAt, updatedAt: subscribe.updatedAt, isSubscribed: !subscribe.isDeleted };

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.UPDATE_ONE_SUBSCRIBE_SUCCESS, subscribe));
  } catch (error) {
    errorHandlers.error(req, error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
