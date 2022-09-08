const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const addWeight = async (client, postId, uuid) => {
  const { rows } = await client.query(
    `
      INSERT INTO weight
      (post_id, uuid)
      VALUES
      ($1, $2)
      RETURNING *
      `,
    [postId, uuid],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updateWeight = async (client, postId, uuid) => {
  const { rows } = await client.query(
    `
      UPDATE weight
      SET uuid = $2, updated_at = now()
      WHERE post_id = $1
      RETURNING *
      `,
    [postId, uuid],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getWeight = async (client, postId) => {
  const { rows } = await client.query(
    `
        SELECT * 
        FROM weight
        WHERE post_id = $1
        AND is_deleted = false
    `,
    [postId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getPostWeightByUuid = async (client, uuid) => {
  const { rows } = await client.query(
    `
        SELECT * 
        FROM weight w
        INNER JOIN post p
        ON w.post_id = p.id
        AND p.is_deleted = false
        AND w.uuid = $1
        AND w.is_deleted = false
    `,
    [uuid],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { addWeight, getWeight, updateWeight, getPostWeightByUuid };
