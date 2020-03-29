const express = require("express");
const Event = require("../models/EventModel");
const User = require("../models/UserModel");
const validateUser = require("../middleware/validateUser");

const Correspondence = require("../models/CorrespondenceModel");
const router = new express.Router();
const { setEventImage } = require("../utils/fireBase");
const multer = require("../utils/Multer");
const { format } = require("util");
const ObjectId = require("mongodb").ObjectId;

router.post(
  // TODO: remoce "set" from path should be: POST: /events/:event_id/image
  "/events/:event_id/image",
  // this validation should on global level not per route
  validateUser,
  multer.single("file"),
  // upload to fire base middleware
  // get event from request middleware
  async (req, res) => {
    // TODO: remove all logic from router to controller
    console.log("Set Profile image");
    const { event_id } = req.params;
    const event = await Event.findById(event_id);
    let file = req.file;
    if (file) {
      setEventImage(event, file)
        .then(async url => {
          event.image_url = format(url);
          console.log(`${format(url)}?alt=media`);
          await event.save();
          res.status(200).send({ data: format(url) });
        })
        // TODO: dont catch errors handle them in error handler middlware
        .catch(error => {
          res.status(500).send({ data: { message: error.message || error } });
        });
    }
  }
);
// TODO: why user and events routes in the same file?
// remove correspondece from event and user
router.patch("/events/:event_id", validateUser, async (req, res) => {
  const { user } = req;
  const { event } = req.body;
  const data = await Event.findByIdAndUpdate(event._id, event);
  res.send({ data });
});

router.get("/events/:event_id", async (req, res) => {
  const { event_id } = req.params;
  const data = await Event.findById(event_id);
  if (!event) {
    return res.status(404).send({ data: { message: "No such event" } });
  }
  res.send({ data });
});

router.delete("/events/:event_id", validateUser, async (req, res) => {
  const { event_id } = req.params;
  const event = await Event.findById(event_id);
  const correspondences = (await Promise.all(
    event.correspondences
      .map(_id => _id.toString())
      .map(_id => {
        return Correspondence.findByIdAndDelete(_id.toString());
      })
  )).filter(Boolean);

  await Promise.all(
    correspondences.map(({ _id, event_id, user_id }) =>
      User.findById(user_id).then(async user => {
        await user.removeCorrespondence(_id);
        await user.removeEvent(event_id);

        user.save();
      })
    )
  );
  if (!event) {
    res.status(404).send({ data: { message: "No such event" } });
  }
  try {
    if (event.admins.includes(req.user._id)) {
      await event.remove();
      return res.send(event);
    } else {
      res.status(403).send({ data: { message: "You atr not authorized" } });
    }
  } catch (error) {
    res.status(500).send({ data: { message: error.message || error } });
  }
});

// add event
// TODO: add contextExtractor middleware to get all data from request so when u get to controler use dont need to extract data from request
// put all the data on context object than if wrrors happen u can log the context and its esasier to debug
router.post("/events", validateUser, async (req, res) => {
  const user = req.user;
  const { _id: user_id } = user;
  const _id = new ObjectId();
  try {
    const correspondence = new Correspondence({
      event_id: _id,
      status: "replied",
      answer: "confirm",
      user_id,
      trigger_user_id: user_id
    });
    const event = new Event({
      ...req.body,
      correspondences: [correspondence._id],
      admins: [user_id],
      _id
    });
    // user.correspondences = user.correspondence.concat(correspondence)

    await event.save().then(() => correspondence.save());
    await User.findOneAndUpdate(
      { _id: user._id },
      {
        $push: { correspondences: correspondence._id, events: event._id }
      }
    );
    res.status(201).send({ data: event });
  } catch (err) {
    console.log(err);
    res
      .status(err.status || 400)
      .send({ data: { message: err.message || err } });
  }
});

module.exports = router;
