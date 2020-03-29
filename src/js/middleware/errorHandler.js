// const swaggerValidator = require('express-ajv-swagger-validation');
// const errors = require('../helpers/errors');
const logger = require("../utils/logger");

function headerErrorValidationMatch(currentError) {
  const re1 = "(\\.)";
  const re2 = "(headers)";
  const re3 = "(.*)";
  return new RegExp(re1 + re2 + re3, ["i"]).exec(currentError);
}

function buildMoreInfo(currentError) {
  const { dataPath, message } = currentError;
  let res = `${dataPath} ${message}`;
  const headerError = headerErrorValidationMatch(dataPath);
  if (headerError != null) {
    res = `request${res}`;
  } else {
    res = `request.body${res}`;
  }
  return res;
}

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  try {
    logger.error({
      message: "An error ocurred",
      err,
      context: req.ctx
    });

    res.status(statusCode).json({ data: { message: err } });
  } catch (error) {
    logger.error({
      message: "An error occurred in errorHandler",
      error,
      context: req.ctx
    });
    res.status(500).json({ data: { message: "Internal Server Error" } });
  }
};
