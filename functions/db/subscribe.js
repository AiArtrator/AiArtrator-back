const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const updateSubscribe = async (client, userId, postId) => {
  const { rows: existingRows } = await client.query(
    `
        SELECT * FROM subscribe
        WHERE user_id = $1
        AND post_id = $2
        `,
    [userId, postId],
  );

  if (existingRows.length === 0) {
    const { rows: addRows } = await client.query(
      `
          INSERT INTO subscribe
          (user_id, post_id)
          VALUES
          ($1, $2)
          RETURNING *
          `,
      [userId, postId],
    );
    return convertSnakeToCamel.keysToCamel(addRows[0]);
  } else {
    const { rows } = await client.query(
      `
            UPDATE subscribe 
            SET updated_at = now(), is_deleted = CASE WHEN is_deleted = true THEN false ELSE true END
            WHERE user_id = $1
            AND post_id = $2
            RETURNING *
            `,
      [userId, postId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  }
};

const getSubscribeListByUserId = async (client, userId) => {
  const { rows } = await client.query(
    `
    SELECT post_id, is_deleted
    FROM subscribe
    WHERE user_id = $1
    AND is_deleted = false
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getSubscribeListByPostId = async (client, userId, postId) => {
  const { rows } = await client.query(
    `
    SELECT is_deleted
    FROM subscribe
    WHERE user_id = $1
    AND post_id = $2
    AND is_deleted = false
    `,
    [userId, postId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { updateSubscribe, getSubscribeListByUserId, getSubscribeListByPostId };
