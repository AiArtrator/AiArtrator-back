const jwtHandlers = require('../lib/jwtHandlers');
const db = require('../db/db');
const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');
const { userDB } = require('../db');
const { TOKEN_INVALID, TOKEN_EXPIRED } = require('../constants/jwt');

const checkUser = async (req, res, next) => {
  // request headers에 accesstoken라는 이름으로 담긴 값(jwt)을 가져옵니다.
  const { accesstoken } = req.headers;

  // accesstoken이 없을 시의 에러 처리입니다.
  if (!accesstoken) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.TOKEN_EMPTY));

  let client;
  try {
    client = await db.connect(req);

    const decodedToken = jwtHandlers.verify(accesstoken);

    if (decodedToken === TOKEN_EXPIRED) return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_EXPIRED));
    if (decodedToken === TOKEN_INVALID) return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_INVALID));

    const userId = decodedToken.id;

    if (!userId) return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_INVALID));

    const user = await userDB.getUserById(client, userId);

    if (!user) return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_USER));

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};

// accesstoken 있으면 user 정보를 주고 없으면 false를 주는 함수
const checkUserInfo = async (req, res, next) => {
  // request headers에 accesstoken라는 이름으로 담긴 값(jwt)을 가져옵니다.
  const { accesstoken } = req.headers;

  let client;
  try {
    client = await db.connect(req);

    if (accesstoken) {
      const decodedToken = jwtHandlers.verify(accesstoken);

      if (decodedToken === TOKEN_EXPIRED) return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_EXPIRED));
      if (decodedToken === TOKEN_INVALID) return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_INVALID));

      const userId = decodedToken.id;

      if (!userId) return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_INVALID));

      const user = await userDB.getUserById(client, userId);

      if (!user) return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.NO_USER));
      req.user = user;
    } else {
      req.user = false;
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};

module.exports = { checkUser, checkUserInfo };
