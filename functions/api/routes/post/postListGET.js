const _ = require('lodash');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { postDB, relationPostTagDB, userDB, subscribeDB } = require('../../../db');
const errorHandlers = require('../../../lib/errorHandlers');
const postImage = require('../../../constants/postImage');

module.exports = async (req, res) => {
  const { search } = req.query;

  let client;

  try {
    client = await db.connect(req);

    const relationPostTagList = await relationPostTagDB.getRelationPostTagList(client);
    let subscribeList = [];
    if (req.user) {
      subscribeList = await subscribeDB.getSubscribeListByUserId(client, req.user.id);
    }

    let postList;
    if (!search) {
      postList = await postDB.getPostList(client);
    } else {
      postList = await postDB.getPostListBySearch(client, search);
    }

    postList = await Promise.all(
      postList.map(async (post) => {
        const writer = await userDB.getUserById(client, post.userId);

        // 태그 정보
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
            id: writer.id,
            nickname: writer.nickname,
          },
          summary: post.summary,
          tagList: post.tagList,
          isSubscribed: isSubscribed,
        };
      }),
    );

    // 검색 결과 전체 포스트 개수 반환

    const data = {
      postListCount: postList.length,
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
