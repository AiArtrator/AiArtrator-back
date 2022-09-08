const _ = require('lodash');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { postDB, relationPostTagDB, tagDB } = require('../../../db');
const errorHandlers = require('../../../lib/errorHandlers');

module.exports = async (req, res) => {
  const { tagIds } = req.body;

  if (!tagIds) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;

  try {
    client = await db.connect(req);

    const tagsByTagIds = await tagDB.getTagListByTagIds(client, tagIds);
    const postTagByTagIds = await relationPostTagDB.getRelationPostTagListByTagIds(client, tagIds);
    const postIds = [...new Set(postTagByTagIds.map((o) => o.postId).filter(Boolean))];
    const posts = await postDB.getPostListByIds(client, postIds);
    const relationPostTags = await relationPostTagDB.getRelationPostTagList(client);
    const tags = await tagDB.getTagList(client);

    for (let i = 0; i < relationPostTags.length; i++) {
      relationPostTags[i].tag = _.find(tags, (tag) => tag.id === relationPostTags[i].tagId);
    }

    for (let i = 0; i < posts.length; i++) {
      posts[i].tags = _.filter(relationPostTags, (pt) => pt.postId === posts[i].id).map((o) => o.tag);
    }

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ALL_POSTS_SUCCESS, posts));
  } catch (error) {
    errorHandlers.error(req, error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
