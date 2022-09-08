const _ = require('lodash');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { inferenceDB, weightDB, paymentDB } = require('../../../db');
const errorHandlers = require('../../../lib/errorHandlers');
const axios = require('axios');
const dayjs = require('dayjs');
const stream = require('stream');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');

module.exports = async (req, res) => {
  const { weightUuid, imageCount } = req.body;

  if (!weightUuid || !imageCount) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;

  try {
    client = await db.connect(req);

    const weight = await weightDB.getPostWeightByUuid(client, weightUuid);
    if (!weight) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.WRONG_WEIGHT_UUID));
    }

    // request image to ML server
    // TODO: more than 2 image count

    const s3 = new AWS.S3({ accessKeyId: process.env.S3_ACCESS_KEY, secretAccessKey: process.env.S3_SECRET_KEY, region: process.env.S3_REGION });

    const uuid = uuidv4();
    const fileName = `images/inference/${dayjs().format('YYYYMMDD_HHmmss_')}${uuid}.png`;
    let contentType = 'application/octet-stream';

    // upload image to s3
    try {
      const uploadStream = () => {
        const pass = new stream.PassThrough();
        s3.upload({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: fileName,
          Body: pass,
          ACL: 'public-read',
          ContentType: contentType,
        }).promise();
        return pass;
      };

      await axios({
        method: 'get',
        url: process.env.ML_BASEURL + `?model_address=${weight.uuid}.onnx`,
        responseType: 'stream',
      }).then((response) => {
        if (response.status === statusCode.OK) {
          contentType = response.headers['content-type'];
          response.data.pipe(uploadStream());
        }
      });
    } catch (error) {
      errorHandlers.error(req, error);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    }

    // pay
    const payment = await paymentDB.getPaymentByUserId(client, req.user.id);
    const fee = weight.fee;

    if (!payment.balance || (fee > 0 && payment.balance < fee)) {
      const message = `결제 실패: ${Math.abs(fee) - payment.balance}토큰 필요!`;
      return res.status(statusCode.PRECONDITION_FAILED).send(util.fail(statusCode.PRECONDITION_FAILED, message));
    } else {
      const balance = payment.balance - fee;
      await paymentDB.addPayment(client, req.user.id, `모델 이용료 ${weight.title}`, fee, balance);
    }

    // add inference
    const imageUrls = [];
    imageUrls.push(`https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${fileName}`);
    const inference = await inferenceDB.addInference(client, weight.postId, imageCount, imageUrls, req.user.id);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.ADD_ONE_INFERENCE_SUCCESS, inference));
  } catch (error) {
    errorHandlers.error(req, error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
