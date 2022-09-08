const _ = require('lodash');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { postDB, relationPostTagDB, userDB, subscribeDB, weightDB } = require('../../../db');
const errorHandlers = require('../../../lib/errorHandlers');
const postImage = require('../../../constants/postImage');

module.exports = async (req, res) => {
  const { postId } = req.params;

  if (!postId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;

  try {
    client = await db.connect(req);

    const relationPostTagList = await relationPostTagDB.getRelationPostTagList(client);

    let post;
    post = await postDB.getPostById(client, postId);

    // weight 정보
    const weight = await weightDB.getWeight(client, postId);
    if (!weight) {
      return res.status(statusCode.PRECONDITION_FAILED).send(util.fail(statusCode.PRECONDITION_FAILED, responseMessage.NO_WEIGHT));
    }

    const writer = await userDB.getUserById(client, post.userId);

    // 태그 정보
    post.tagList = _.filter(relationPostTagList, (r) => r.postId === post.id).map((o) => {
      return { id: o.tagId, name: o.tagName };
    });

    // 구독 정보
    let isSubscribed;
    if (req.user) {
      const subscribeData = await subscribeDB.getSubscribeListByPostId(client, req.user.id, postId);
      isSubscribed = subscribeData.length > 0 ? (subscribeData.isDeleted ? false : true) : false;
    } else {
      isSubscribed = false;
    }

    post = {
      id: post.id,
      thumbnail: post.thumbnail ? post.thumbnail : postImage.DEFAULT_IMAGE_URL,
      title: post.title,
      updatedAt: post.updatedAt,
      writer: {
        id: writer.id,
        nickname: writer.nickname,
      },
      ver: post.ver,
      summary: post.summary,
      tagList: post.tagList,
      description: post.description,
      isSubscribed: isSubscribed,
      weightUuid: weight.uuid,
      weightUpdatedAt: weight.updatedAt,
      fee: post.fee,
    };

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ONE_POST_SUCCESS, post));
  } catch (error) {
    errorHandlers.error(req, error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
