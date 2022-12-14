const jwt = require('jsonwebtoken');
const { TOKEN_INVALID, TOKEN_EXPIRED } = require('../constants/jwt');

const secretKey = process.env.JWT_SECRET;
const options = {
  algorithm: 'HS256',
  expiresIn: '30d',
  issuer: 'pog',
};

const sign = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    idFirebase: user.idFirebase,
  };

  const result = {
    accesstoken: jwt.sign(payload, secretKey, options),
  };
  return result;
};

// JWT를 해독하고, 해독한 JWT가 우리가 만든 JWT가 맞는지 확인합니다 (인증).
const verify = (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, secretKey);
  } catch (err) {
    if (err.message === 'jwt expired') {
      console.log('expired token');
      return TOKEN_EXPIRED;
    } else if (err.message === 'invalid token') {
      console.log('invalid token');
      return TOKEN_INVALID;
    } else {
      console.log('invalid token');
      return TOKEN_INVALID;
    }
  }

  return decoded;
};

module.exports = {
  sign,
  verify,
};
