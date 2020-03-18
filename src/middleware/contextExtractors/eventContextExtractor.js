module.exports = async (req, res, next) => {
  console.log("Set Profile image");
  const { event_id } = req.params;
  const context = { eventId: event_id };
  req.context = context;
  next();
};
