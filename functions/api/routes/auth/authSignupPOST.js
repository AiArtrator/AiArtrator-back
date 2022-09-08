const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB, paymentDB } = require('../../../db');
const admin = require('firebase-admin');
const errorHandlers = require('../../../lib/errorHandlers');
const jwtHandlers = require('../../../lib/jwtHandlers');

module.exports = async (req, res) => {
  const { email, nickname, phone, organization, password } = req.body;

  if (!email || !nickname || !phone || !password) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    // check duplicate email
    const nicknameUser = await userDB.getUserByNickname(client, nickname);
    if (nicknameUser) {
      return res.status(statusCode.CONFLICT).send(util.fail(statusCode.CONFLICT, '이미 가입된 닉네임입니다.'));
    }

    // check duplicate phone
    const phoneUser = await userDB.getUserByPhone(client, phone);
    if (phoneUser) {
      return res.status(statusCode.CONFLICT).send(util.fail(statusCode.CONFLICT, '이미 가입된 번호입니다.'));
    }

    const userFirebase = await admin
      .auth()
      .createUser({ email, password })
      .then((user) => user)
      .catch((e) => {
        console.log(e);
        return { err: true, error: e };
      });

    if (userFirebase.err) {
      if (userFirebase.error.code === 'auth/email-already-exists') {
        return res.status(statusCode.CONFLICT).send(util.fail(statusCode.CONFLICT, '이미 가입된 메일입니다.'));
      } else if (userFirebase.error.code === 'auth/invalid-password') {
        return res.status(statusCode.PRECONDITION_FAILED).send(util.fail(statusCode.PRECONDITION_FAILED, '비밀번호 형식이 잘못되었습니다. 패스워드는 최소 6자리의 문자열이어야 합니다.'));
      } else {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
      }
    }

    const user = await userDB.addUser(client, email, organization, userFirebase.uid, nickname, phone);
    const { accesstoken } = jwtHandlers.sign(user);

    // add membership token
    const membershipToken = 1000;
    await paymentDB.addPayment(client, user.id, 'Membership event', membershipToken, membershipToken);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CREATED_USER, { user, accesstoken }));
  } catch (error) {
    errorHandlers.error(req, error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
