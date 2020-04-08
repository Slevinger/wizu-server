const express = require("express");
const User = require("../models/UserModel");
const Event = require("../models/EventModel");
const { format } = require("util");
const validateUser = require("../middleware/validateUser");
const {
  collectCorrespondences,
  getCorrespondencesByUser
} = require("../middleware/collectCorrespondences");
const { setProfileImage, setUserCoverPhoto } = require("../utils/fireBase");

const multer = require("../utils/Multer");

const router = new express.Router();

// get users
router.get("/users/me", validateUser, collectCorrespondences, (req, res) => {
  try {
    const data = {
      ...req.user.toJSON(),
      friends: req.friends,
      correspondences: req.correspondences
    };
    return res.send({ data });
  } catch (err) {
    console.log(err);
  }
});
router.get(
  "/users/me/events",
  validateUser,
  collectCorrespondences,
  async (req, res) => {
    const user = req.user;
    const correspondences = req.correspondences;
    const events = Object.keys(correspondences).reduce(
      (acc, correspondenceId) => {
        console.log(correspondences[correspondenceId].answer);
        return {
          ...acc,
          [correspondences[correspondenceId].answer]: [
            ...(acc[correspondences[correspondenceId].answer] || []),
            correspondences[correspondenceId].event_id
          ]
        };
      },
      {}
    );

    for (let key in events) {
      events[key] = await Promise.all(
        events[key].map(event_id => {
          return Event.findById(event_id);
        })
      );
    }

    console.log(events);

    res.send({ data: events });
  }
);
router.get("/users/:user_id", validateUser, async (req, res) => {
  const user = await User.findById(req.params.user_id, {
    email: 1,
    username: 1,
    phone: 1,
    profileImage: 1,
    coverPhoto: 1,
    friends: 1
  });
  return res.send({ data: user.toJSON() });
});

router.post(
  "/users/me/avatar",
  validateUser,
  multer.single("file"),
  async (req, res) => {
    console.log("Set Profile image");

    let file = req.file;
    if (file) {
      setProfileImage(req.user, file)
        .then(async url => {
          const user = req.user;
          user.profileImage = format(url);
          console.log(`${format(url)}?alt=media`);
          await user.save();
          res.status(200).send({ data: format(url) });
        })
        .catch(error => {
          console.error(error);
        });
    }
  }
);

router.post(
  "/users/me/cover-photo",
  validateUser,
  multer.single("file"),
  async (req, res) => {
    console.log("Set CoverPhoto image");

    let file = req.file;
    if (file) {
      setUserCoverPhoto(req.user, file)
        .then(async url => {
          const user = req.user;
          user.coverPhoto = format(url);
          console.log(`${format(url)}?alt=media`);
          await user.save();
          res.status(200).send({ data: format(url) });
        })
        .catch(error => {
          console.error(error);
        });
    }
  }
);
router.get("/users/suggestions", validateUser, async (req, res) => {});

router.patch("/users/me", validateUser, async (req, res) => {
  const updates = Object.keys(req.body);

  const allowedUpdates = ["password", "email"];
  const isValidUpdate = updates.every(update =>
    allowedUpdates.includes(update)
  );
  if (!isValidUpdate) {
    return res.status(400).send({ data: { message: "Invalid updates" } });
  }
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).send({ data: { message: "No such user" } });
    }
    updates.forEach(update => {
      user[update] = req.body[update];
    });
    await user.save();
    res.send(user);
  } catch (err) {
    res.status(409).send({ data: { message: err.message || err } });
  }
});

router.post("/users/get", validateUser, async (req, res) => {
  const { phoneNumbers = [] } = req.context;
  try {
    const users = await User.find(
      { phone: { $in: phoneNumbers } },
      { username: 1, phone: 1, email: 1, profileImage: 1 }
    );
    console.log(users);
    res.send({ data: users });
  } catch (error) {
    res
      .status(405)
      .send({ data: { message: "fail at user router get /users" } });
  }
});

// create user
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.generateAuthToken(user);

    user
      .save()
      .then(() => {
        res.status(201).send({ data: { user, token } });
      })
      .catch(error => {
        res.status(400).send({ data: { message: error || error.message } });
      });
  } catch ({ message }) {
    res.status(500).send({ data: { message } });
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body);
    const token = await user.generateAuthToken(user);
    const ret = user.toJSON();
    const correspondences = await getCorrespondencesByUser(user);
    console.log(correspondences);
    ret.correspondences = Object.values(correspondences);
    res.send({ data: { user: ret, token } });
  } catch (error) {
    res.status(401).send({ data: { message: error.message || error } });
  }
});

router.post("/users/logout", validateUser, async (req, res) => {
  try {
    const user = req.user;
    user.tokens.splice(
      user.tokens.indexOf(token => token.token == req.token),
      1
    );
    await user.save();
    res.send(user);
  } catch (err) {
    res.status(401).send({ data: { message: err || err.message } });
  }
});

router.delete("/users/me", validateUser, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
