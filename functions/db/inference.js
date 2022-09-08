const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getInferenceListByPostId = async (client, postId, userId) => {
  const { rows } = await client.query(
    `
      SELECT * 
      FROM inference
      WHERE post_id = $1
      AND user_id = $2
      AND is_deleted = false
      ORDER BY id
      `,
    [postId, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const addInference = async (client, postId, imageCount, imageUrls, userId) => {
  const { rows } = await client.query(
    `
      INSERT INTO inference
      (post_id, image_count, image_urls, user_id)
      VALUES
      ($1, $2, $3, $4)
      RETURNING *
      `,
    [postId, imageCount, imageUrls, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updateInference = async (client, imageUrls, id) => {
  const { rows } = await client.query(
    `
      UPDATE inference
      SET image_urls = $2
      WHERE id = $1
      RETURNING *
      `,
    [id, imageUrls],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { addInference, updateInference, getInferenceListByPostId };
