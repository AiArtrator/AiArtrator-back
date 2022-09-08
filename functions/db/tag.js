const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const addTag = async (client, name) => {
  const { rows } = await client.query(
    `
    INSERT INTO tag
    (name)
    VALUES
    ($1)
    RETURNING *
    `,
    [name],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getTagList = async (client) => {
  const { rows } = await client.query(
    `
      SELECT * FROM tag
      WHERE is_deleted = false
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getTagListByTagIds = async (client, tagIds) => {
  const { rows } = await client.query(
    `
        SELECT * FROM tag
        WHERE id IN (${tagIds.join()})
        AND is_deleted = false
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getTagList, getTagListByTagIds, addTag };
