module.exports = async (req, res, next) => {
  const context = Object.keys(req.params || {}).reduce(
    (acc, param) => ({
      ...acc,
      [param]: req.params[param]
    }),
    {}
  );
  req.context = context;
  next();
};
