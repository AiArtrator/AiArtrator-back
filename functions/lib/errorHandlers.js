const log = (req, error) => {
  const title = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`;
  const content = `[CONTENT] ${error}`;

  console.log(error);
};

const error = (req, error) => {
  log(req, error);
};

module.exports = {
  error,
};
