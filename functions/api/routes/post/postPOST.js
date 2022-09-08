const _ = require('lodash');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { postDB, tagDB, relationPostTagDB } = require('../../../db');
const errorHandlers = require('../../../lib/errorHandlers');

module.exports = async (req, res) => {
  const { title, summary, description, ver, tagList, fee } = req.body;
  const thumbnail = req.file;

  // tagList는 "tag1,tag2,tag3" 형식
  let addTagList = [];
  if (tagList) {
    addTagList = tagList.split(',');
  }

  if (addTagList.length > 10) {
    return res.status(statusCode.PRECONDITION_FAILED).send(util.fail(statusCode.PRECONDITION_FAILED, responseMessage.TAG_COUNT_FAIL));
  }

  // "#tag1 #tag2 #tag3" 형식의 경우, 공백을 기준으로 자른 후 # 제거
  // let tagList = tags.split(' ');
  // tagList = tagList.map((tag) => {
  //   return tag.substring(1);
  // });

  if (!title || !summary || !fee) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    const post = await postDB.addPost(client, req.user.id, title, description, ver, thumbnail?.location, summary, fee);

    const addRelationPostTagList = [];
    let getTagList = await tagDB.getTagList(client);

    // 쿼리로 들어온 태그가 이미 존재하는 태그인지 확인 후
    // 존재하는 태그가 아니면 태그 생성, 존재하는 태그이면 post와 tag의 relation만 생성
    for (let i = 0; i < addTagList.length; i++) {
      let existingTag = _.find(getTagList, (tag) => tag.name === addTagList[i]);
      if (!existingTag) {
        let addTag = await tagDB.addTag(client, addTagList[i]);
        getTagList.push(addTag);
        if (!addTag) {
          res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.ADD_ONE_TAG_FAIL));
        }
        addRelationPostTagList[i] = await relationPostTagDB.addRelationPostTag(client, post.id, addTag.id);
      } else {
        addRelationPostTagList[i] = await relationPostTagDB.addRelationPostTag(client, post.id, existingTag.id);
      }
    }

    // response 보내는 post에 tag 붙이기
    for (let i = 0; i < addRelationPostTagList.length; i++) {
      addRelationPostTagList[i].tag = _.find(getTagList, (tag) => tag.id === addRelationPostTagList[i].tagId);
    }

    post.tagList = _.filter(addRelationPostTagList, (r) => r.postId === post.id).map((o) => {
      return { id: o.tag.id, name: o.tag.name };
    });

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.ADD_ONE_POST_SUCCESS, post));
  } catch (error) {
    errorHandlers.error(req, error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
