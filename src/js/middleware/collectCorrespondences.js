const Correspondence = require("../models/CorrespondenceModel");
const Event = require("../models/EventModel");

const getCorrespondencesByUser = async user => {
  const cors = (await Promise.all(
    user.correspondences.map(id => Correspondence.findById(id.toString()))
  )).filter(Boolean);
  const correspondences = await cors
    .sort((a, b) => b.timeStamp - a.timeStamp)
    .reduce(async (previousPromise, correspondence) => {
      const collection = await previousPromise;
      let event = await Event.findById(correspondence.event_id, {
        name: 1,
        date: 1,
        location: 1,
        image_url: 1,
        friends: 1
      });

      if (event) {
        event = event.toJSON();
      } else {
        event = {};
      }
      return {
        ...collection,
        [correspondence._id.toString()]: {
          ...correspondence.toJSON(),
          event
        }
      };
    }, Promise.resolve({}));
  return correspondences;
};

const collectCorrespondences = async function(req, res, next) {
  try {
    req.correspondences = await getCorrespondencesByUser(req.user);
    next();
  } catch (err) {
    res.status(401).send({ error: "please authenticate" });
  }
};

module.exports = { collectCorrespondences, getCorrespondencesByUser };
