const _ = require('lodash');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { postDB, relationPostTagDB, userDB, subscribeDB } = require('../../../db');
const errorHandlers = require('../../../lib/errorHandlers');
const postImage = require('../../../constants/postImage');

module.exports = async (req, res) => {
  const { userId } = req.params;
  let { filter, search } = req.query;

  if (!userId || !filter) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;

  try {
    client = await db.connect(req);

    const relationPostTagList = await relationPostTagDB.getRelationPostTagList(client);
    const user = await userDB.getUserById(client, userId);

    let postList;

    // search 값이 없을 때, 빈 스트링으로 조회하면 전체 결과 나옴
    if (!search) {
      search = '';
    }

    // 구독 정보
    let subscribeList = [];
    if (req.user) {
      subscribeList = await subscribeDB.getSubscribeListByUserId(client, req.user.id);
    }

    // filter에 따라 다른 쿼리로 postList 조회
    if (filter === 'upload') {
      postList = await postDB.getPostListByUserIdSearch(client, userId, search);
    } else if (filter === 'subscribe') {
      postList = await postDB.getPostListBySubscribeSearch(client, userId, search);
    } else if (filter === 'inference') {
      postList = await postDB.getPostListByInferenceSearch(client, userId, search);
    } else {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.WRONG_FILTER));
    }

    // postList data
    postList = postList.map((post) => {
      post.tagList = _.filter(relationPostTagList, (r) => r.postId === post.id).map((o) => {
        return { id: o.tagId, name: o.tagName };
      });

      // 구독 정보
      let isSubscribed;
      if (subscribeList.length === 0) {
        isSubscribed = false;
      } else {
        const subscribeData = _.find(subscribeList, (s) => s.postId === post.id);

        isSubscribed = subscribeData ? (subscribeData.isDeleted ? false : true) : false;
      }

      return {
        id: post.id,
        thumbnail: post.thumbnail ? post.thumbnail : postImage.DEFAULT_IMAGE_URL,
        title: post.title,
        writer: {
          id: post.userId,
          nickname: post.userNickname,
        },
        summary: post.summary,
        tagList: post.tagList,
        isSubscribed: isSubscribed,
      };
    });

    // response로 보낼 data, 해당 user의 정보와 postList를 보냄
    const data = {
      user: {
        id: user.id,
        nickname: user.nickname,
      },
      postList,
    };

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ALL_POSTS_SUCCESS, data));
  } catch (error) {
    errorHandlers.error(req, error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
