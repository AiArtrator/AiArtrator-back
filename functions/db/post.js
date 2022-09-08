const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getPostList = async (client) => {
  const { rows } = await client.query(
    `
    SELECT p.*
    FROM post p
    INNER JOIN weight w
      ON p.id = w.post_id
      AND w.is_deleted = false
      AND p.is_deleted = false
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getPostById = async (client, postId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM post p
    WHERE id = $1
    AND is_deleted = false
    `,
    [postId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const addPost = async (client, userId, title, description, ver, thumbnail, summary, fee) => {
  const { rows } = await client.query(
    `
    INSERT INTO post
    (user_id, title, description, ver, thumbnail, summary, fee)
    VALUES
    ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `,
    [userId, title, description, ver, thumbnail, summary, fee],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updatePost = async (client, title, description, ver, thumbnail, postId, summary, fee) => {
  const { rows: existingRows } = await client.query(
    `
    SELECT * FROM post p
    WHERE id = $1
    AND is_deleted = false
    `,
    [postId],
  );

  if (existingRows.length === 0) return false;

  const data = _.merge({}, convertSnakeToCamel.keysToCamel(existingRows[0]), { title, description, ver, thumbnail, summary, fee });

  const { rows } = await client.query(
    `
    UPDATE post p
    SET title = $1, description = $2, ver = $3, thumbnail = $4, summary = $5, fee = $6, updated_at = now()
    WHERE id = $7
    RETURNING * 
    `,
    [data.title, data.description, data.ver, data.thumbnail, data.summary, data.fee, postId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const deletePost = async (client, postId) => {
  const { rows } = await client.query(
    `
    UPDATE post p
    SET is_deleted = true, updated_at = now()
    WHERE id = $1
    RETURNING *
    `,
    [postId],
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getPostListByUserIdSearch = async (client, userId, search) => {
  const { rows } = await client.query(
    `    
    SELECT p.*, u.nickname user_nickname
    FROM post p
    INNER JOIN "user" u
      ON p.user_id = u.id
      AND u.is_deleted = false
    INNER JOIN weight w
      ON p.id = w.post_id
      AND w.is_deleted = false
      AND p.is_deleted = false
      AND p.user_id = $1
      AND (p.title LIKE '%${search}%'
      OR p.summary LIKE '%${search}%'
      OR p.id = ANY (SELECT r.post_id
      FROM relation_post_tag r
      INNER JOIN tag t
      ON t.id = r.tag_id
      AND t.name LIKE '%${search}%'
      AND r.is_deleted = false
      AND t.is_deleted = false))
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getPostListBySubscribeSearch = async (client, userId, search) => {
  const { rows } = await client.query(
    `    
    SELECT p.*, u.nickname user_nickname
    FROM post p
    INNER JOIN "user" u
      ON p.user_id = u.id
      AND u.is_deleted = false
    INNER JOIN weight w
      ON p.id = w.post_id
      AND w.is_deleted = false
      AND p.is_deleted = false
      AND p.id = ANY ( SELECT s.post_id
        FROM subscribe s
        WHERE s.user_id = $1
        AND s.is_deleted = false
      )
      AND (p.title LIKE '%${search}%'
      OR p.summary LIKE '%${search}%'
      OR p.id = ANY (SELECT r.post_id
        FROM relation_post_tag r
        INNER JOIN tag t
        ON t.id = r.tag_id
        AND t.name LIKE '%${search}%'
        AND r.is_deleted = false
        AND t.is_deleted = false))
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};
const getPostListByInferenceSearch = async (client, userId, search) => {
  const { rows } = await client.query(
    `    
    SELECT p.*, u.nickname user_nickname
    FROM post p
    INNER JOIN "user" u
      ON p.user_id = u.id
      AND u.is_deleted = false
    INNER JOIN weight w
      ON p.id = w.post_id
      AND w.is_deleted = false
      AND p.is_deleted = false
      AND p.id = ANY ( SELECT i.post_id
        FROM inference i
        WHERE i.user_id = $1
        AND i.is_deleted = false
      )
      AND (p.title LIKE '%${search}%'
      OR p.summary LIKE '%${search}%'
      OR p.id = ANY (SELECT r.post_id
        FROM relation_post_tag r
        INNER JOIN tag t
        ON t.id = r.tag_id
        AND t.name LIKE '%${search}%'
        AND r.is_deleted = false
        AND t.is_deleted = false))
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getPostListByUserIds = async (client, userIds) => {
  if (userIds.length < 1) return [];
  const { rows } = await client.query(
    `
    SELECT * FROM post
    WHERE user_id IN (${userIds.join()})
    AND is_deleted = false
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getPostListByIds = async (client, postIds) => {
  const { rows } = await client.query(
    `
    SELECT * FROM post
    WHERE id IN (${postIds.join()})
    AND is_deleted = false
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getPostListBySearch = async (client, search) => {
  const { rows } = await client.query(
    `
    SELECT p.*
    FROM post p
    INNER JOIN weight w
      ON p.id = w.post_id
      AND w.is_deleted = false
    WHERE (p.title LIKE '%${search}%'
    OR p.summary LIKE '%${search}%'
    OR p.id = ANY (SELECT r.post_id
      FROM relation_post_tag r
      INNER JOIN tag t
      ON t.id = r.tag_id
      AND t.name LIKE '%${search}%'
      AND r.is_deleted = false
      AND t.is_deleted = false))
    AND p.is_deleted = false
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = {
  getPostList,
  getPostById,
  addPost,
  updatePost,
  deletePost,
  getPostListByUserIdSearch,
  getPostListBySubscribeSearch,
  getPostListByInferenceSearch,
  getPostListByUserIds,
  getPostListByIds,
  getPostListBySearch,
};
