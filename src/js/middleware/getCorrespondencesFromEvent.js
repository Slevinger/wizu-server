const Correspondence = require("../models/CorrespondenceModel");

const getCorrespondencesFromEvent = async function(req, res, next) {
  try {
    const user = req.user;
    const correspondence = Object.keys(req.correspondences).filter(
      id => req.correspondences[id].event_id === req.context.eventId
    )[0];

    req.correspondence = await Correspondence.findById(correspondence);
    //req.event = event;

    next();
  } catch (err) {
    res.status(401).send({ data: { message: "please authenticate" } });
  }
};

module.exports = getCorrespondencesFromEvent;
