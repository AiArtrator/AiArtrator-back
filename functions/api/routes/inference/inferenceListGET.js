const _ = require('lodash');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { inferenceDB } = require('../../../db');
const errorHandlers = require('../../../lib/errorHandlers');

module.exports = async (req, res) => {
  const { postId } = req.params;

  if (!postId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;

  try {
    client = await db.connect(req);

    let inferenceList = await inferenceDB.getInferenceListByPostId(client, postId, req.user.id);

    inferenceList = inferenceList.map((inference, index) => {
      const currentImageCount = inference.imageUrls ? inference.imageUrls.length : 0;
      const totalImageCount = inference.imageCount;

      const content = currentImageCount != totalImageCount ? '생성 진행 중' : index === 0 ? '최근에 생성한 이미지' : '과거에 생성한 이미지';
      const imageCount = currentImageCount != totalImageCount ? `총 ${currentImageCount}/${totalImageCount}장` : `총 ${totalImageCount}장`;

      return {
        id: inference.id,
        content: content,
        createdAt: inference.createdAt,
        imageCount: imageCount,
        imageUrls: inference.imageUrls,
      };
    });

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ALL_INFERENCES_SUCCESS, inferenceList));
  } catch (error) {
    errorHandlers.error(req, error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
