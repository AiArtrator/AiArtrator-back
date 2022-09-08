const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getUserById = async (client, userId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM "user"
    WHERE id = $1
    AND is_deleted = false
    `,
    // client.query()의 두 번째 파라미터에는, 쿼리문에 집어넣고 싶은 변수들의 배열을 적습니다.
    // $1에는 배열의 첫번째 변수가, $2에는 배열의 두 번째 변수... 이런 식으로 쿼리문에 변수가 들어가게 됩니다!
    [userId],
  );
  // 위의 getAllUsers와는 달리, 이번에는 유저 하나만 가져오고 싶기 때문에 rows[0]만 리턴해 줍니다.
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getUserByIdFirebase = async (client, idFirebase) => {
  const { rows } = await client.query(
    `
    SELECT * FROM "user"
    WHERE id_firebase = $1
    AND is_deleted = false
    `,
    [idFirebase],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getUserByEmail = async (client, email) => {
  const { rows } = await client.query(
    `
    SELECT * FROM "user"
    WHERE email = $1
    AND is_deleted = false
    `,
    [email],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getUserByNickname = async (client, nickname) => {
  const { rows } = await client.query(
    `
    SELECT * FROM "user"
    WHERE nickname = $1
    AND is_deleted = false
    `,
    [nickname],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getUserByPhone = async (client, phone) => {
  const { rows } = await client.query(
    `
    SELECT * FROM "user"
    WHERE phone = $1
    AND is_deleted = false
    `,
    [phone],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updateUser = async (client, nickname, phone, organization, userId) => {
  const { rows: existingRows } = await client.query(
    `
    SELECT * FROM "user"
    WHERE id = $1
    AND is_deleted = false
    `,
    [userId],
  );

  if (existingRows.length === 0) return false;

  const data = _.merge({}, convertSnakeToCamel.keysToCamel(existingRows[0]), { nickname, phone, organization });

  const { rows } = await client.query(
    `
    UPDATE "user"
    SET nickname = $1, phone = $2, organization = $3, updated_at = now()
    WHERE id = $4
    RETURNING * 
    `,
    [data.nickname, data.phone, data.organization, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const deleteUser = async (client, userId) => {
  const { rows } = await client.query(
    `
    UPDATE "user"
    SET is_deleted = true, updated_at = now()
    WHERE id = $1
    RETURNING *
    `,
    [userId],
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const addUser = async (client, email, organization, idFirebase, nickname, phone) => {
  const { rows } = await client.query(
    `
    INSERT INTO "user"
    (email, organization, id_firebase, nickname, phone)
    VALUES
    ($1, $2, $3, $4, $5)
    RETURNING *
    `,

    [email, organization, idFirebase, nickname, phone],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { getUserById, getUserByIdFirebase, getUserByEmail, getUserByPhone, getUserByNickname, updateUser, deleteUser, addUser };
