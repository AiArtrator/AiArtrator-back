const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB } = require('../../../db');
const errorHandlers = require('../../../lib/errorHandlers');

module.exports = async (req, res) => {
  const { nickname, phone, organization } = req.body;
  if (!nickname || !phone) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    // 닉네임 중복 검사
    if (req.user.nickname !== nickname) {
      const nicknameUser = await userDB.getUserByNickname(client, nickname);
      if (nicknameUser) {
        return res.status(statusCode.CONFLICT).send(util.fail(statusCode.CONFLICT, '이미 가입된 닉네임입니다.'));
      }
    }

    // 휴대폰 번호 중복 검사
    if (req.user.phone !== phone) {
      const phoneUser = await userDB.getUserByPhone(client, phone);
      if (phoneUser) {
        return res.status(statusCode.CONFLICT).send(util.fail(statusCode.CONFLICT, '이미 가입된 번호입니다.'));
      }
    }

    const updatedUser = await userDB.updateUser(client, nickname, phone, organization, req.user.id);
    if (!updatedUser) return res.status(statusCode.NOT_FOUND).send(util.fail(statusCode.NOT_FOUND, responseMessage.NO_USER));

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.UPDATE_ONE_USER_SUCCESS, updatedUser));
  } catch (error) {
    errorHandlers.error(req, error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
