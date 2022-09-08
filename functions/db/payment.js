const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getPaymentListByUserId = async (client, userId) => {
  const { rows } = await client.query(
    `
    SELECT id, content, price, balance, created_at FROM payment
    WHERE user_id = $1
    AND is_deleted = false
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getPaymentByUserId = async (client, userId) => {
  const { rows } = await client.query(
    `
    SELECT balance FROM payment
    WHERE user_id = $1
    AND is_deleted = false
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[rows.length - 1]);
};

const addPayment = async (client, userId, content, price, balance) => {
  const { rows } = await client.query(
    `
      INSERT INTO payment
      (user_id, content, price, balance)
      VALUES
      ($1, $2, $3, $4)
      RETURNING *
      `,
    [userId, content, price, balance],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { getPaymentListByUserId, getPaymentByUserId, addPayment };
