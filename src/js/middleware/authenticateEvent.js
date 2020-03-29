const User = require("../models/UserModel");
const Event = require("../models/EventModel");

const authenticateEvent = async function(req, res, next) {
  try {
    const event_id = req.params.event_id;
    const user = req.user;

    const event = await Event.findOne({ _id: event_id, admins: user._id });
    if (!event) {
      // TODO: throw 404 user not found
      return res.status(404).send({ data: { message: `no event ` } });
    }
    req.event = event;
    next();
  } catch (err) {
    res.status(404).send({ data: { message: `no event ` } });
  }
};

module.exports = authenticateEvent;
