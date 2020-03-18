const mongoose = require("mongoose");
const Event = require("../EventModel");
const User = require("../UserModel");
const ObjectId = require("mongodb").ObjectId;
const Schema = mongoose.Schema;

const CorrespondenceSchema = new Schema({
  event_id: {
    type: String,
    validate(value) {
      Event.findOne({ _id: ObjectId(value) }).then(event => {
        if (event === null) {
          throw new Error("No such Event in the DB");
        }
      });
    }
  },
  correspondence_type: {
    type: String,
    default: "RSVP"
  }, // RSVP | FRIEND_REQ
  email: {
    type: String,
    required: true,
    trim: true,
    validate(email) {
      User.findOne({ email }).then(user => {
        if (user === null) {
          throw new Error("No such User in the DB");
        }
      });
    }
  },
  trigger_email: {
    type: String,
    required: true,
    trim: true,
    validate(email) {
      User.findOne({ email }).then(user => {
        if (user === null) {
          throw new Error("No such User in the DB");
        }
      });
    }
  },
  answer: {
    type: String,
    default: "not seen yet"
  }, // confirm | reject | maybe | no replay |not seen yet,
  timeStamp: {
    type: Number,
    default: Date.now()
  }
});

module.exports = CorrespondenceSchema;
