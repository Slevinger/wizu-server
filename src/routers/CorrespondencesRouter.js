const express = require("express");
const Correspondence = require("../models/CorrespondenceModel");
const User = require("../models/UserModel");
const Event = require("../models/EventModel");
const validateUser = require("../middleware/validateUser");
const collectCorrespondences = require("../middleware/collectCorrespondences");
const getCorrespondencesFromEvent = require("../middleware/getCorrespondencesFromEvent");

const router = new express.Router();

router.get(
  "/correspondences/me",
  validateUser,
  collectCorrespondences,
  (req, res) => {
    res.send(req.correspondences);
  }
);

router.post(
  "/correspondences/:response",
  validateUser,
  collectCorrespondences,
  getCorrespondencesFromEvent,
  async (req, res) => {
    try {
      const { response } = req.params;
      const correspondence = req.correspondence;
      correspondence.answer = response;
      await correspondence.save();
      res.send(correspondence);
    } catch (error) {
      res.status(500).send(error.message);
    }
    // console.log(correspondence);
  }
);
router.post(
  "/correspondences/:event_id/add/:email",
  validateUser,
  collectCorrespondences,
  async (req, res) => {
    const { event_id, email } = req.params;
    const user = req.user;
    console.log(user);
    // if (user.correspondences)
    try {
      const correspondence = new Correspondence({
        event_id: event_id,
        status: "sent",
        email,
        trigger_email: req.user.email
      });
      await Promise.all([
        User.findOneAndUpdate(
          { email },
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
