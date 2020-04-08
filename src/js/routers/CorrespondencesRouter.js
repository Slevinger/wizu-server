const express = require("express");
const Correspondence = require("../models/CorrespondenceModel");
const User = require("../models/UserModel");
const Event = require("../models/EventModel");
const validateUser = require("../middleware/validateUser");
const contextExtractor = require("../middleware/contextExtractor");
const {
  collectCorrespondences
} = require("../middleware/collectCorrespondences");
const getCorrespondencesFromEvent = require("../middleware/getCorrespondencesFromEvent");
const values = require("lodash/value");
const router = new express.Router();

router.get(
  "/correspondences/me",
  validateUser,
  collectCorrespondences,
  (req, res) => {
    res.send(req.correspondences);
  }
);
router.patch(
  "/correspondences/users/:trigger_user_id/:answer",
  validateUser,
  collectCorrespondences,
  async (req, res) => {
    try {
      const { answer, trigger_user_id } = req.params;
      const correspondencesIds = Object.values(req.correspondences)
        .filter(
          cor =>
            cor.trigger_user_id.toString() === trigger_user_id &&
            cor.correspondence_type === "FRIEND_REQ"
        )
        .map(({ _id }) => _id.toString());
      console.log(correspondencesIds);
      const correspondences = await Correspondence.find({
        _id: {
          $in: correspondencesIds
        }
      });
      correspondences.forEach(cor => (cor.answer = answer));
      await Promise.all(correspondences.map(cor => cor.save()));
      res.send({ data: correspondences });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);
router.patch(
  "/correspondences/events/:event_id/:answer",
  validateUser,
  contextExtractor,
  collectCorrespondences,
  getCorrespondencesFromEvent,
  async (req, res) => {
    try {
      const { answer } = req.params;
      const correspondence = req.correspondence;

      correspondence.answer = answer;
      await correspondence.save();
      res.send(correspondence);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.post(
  "/correspondences/users/invite/:phone",
  validateUser,
  contextExtractor,
  collectCorrespondences,
  async (req, res) => {
    const { phone } = req.context;
    const otherUser = await User.findOne({ phone });
    const userData = otherUser
      ? { user_id: otherUser._id.toString() }
      : { phone };
    const user = req.user;
    console.log(user);
    // if (user.correspondences)
    try {
      const correspondence = new Correspondence({
        status: "sent",
        correspondence_type: "FRIEND_REQ",
        ...userData,
        trigger_user_id: user._id
      });
      await User.findByIdAndUpdate(user._id, {
        $push: { correspondences: correspondence._id }
      });
      otherUser &&
        (await User.findByIdAndUpdate(otherUser._id, {
          $push: { correspondences: correspondence._id }
        }));
      await correspondence.save();
      res.status(201).send(correspondence);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
router.post(
  "/correspondences/:event_id/add/:user_id",
  validateUser,
  collectCorrespondences,
  async (req, res) => {
    const { event_id, user_id } = req.params;
    const user = req.user;
    console.log(user);
    // if (user.correspondences)
    try {
      const correspondence = new Correspondence({
        event_id: event_id,
        status: "sent",
        user_id,
        trigger_user_id: req.user._id
      });
      await Promise.all([
        User.findOneAndUpdate(
          { _id: user_id },
          { $push: { correspondences: correspondence._id } }
        ),
        Event.findByIdAndUpdate(event_id, {
          $push: { correspondences: correspondence._id }
        })
      ]);
      await correspondence.save();
      res.status(201).send(correspondence);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

module.exports = router;
