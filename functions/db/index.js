// db와 상호작용하는 코드
module.exports = {
  userDB: require('./user'),
  postDB: require('./post'),
  tagDB: require('./tag'),
  relationPostTagDB: require('./relationPostTag'),
  subscribeDB: require('./subscribe'),
  weightDB: require('./weight'),
  paymentDB: require('./payment'),
  inferenceDB: require('./inference'),
};
