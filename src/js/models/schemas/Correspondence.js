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
  user_id: {
    type: String,
    required: true,
    trim: true,
    validate(_id) {
      User.findById(_id).then(user => {
        if (user === null) {
          throw new Error(`No such user_id ${_id} in the DB`);
        }
      });
    }
  },
  trigger_user_id: {
    type: Schema.ObjectId,
    required: true,
    validate(_id) {
      User.findById(_id).then(user => {
        if (user === null) {
          throw new Error(`No such trigger_user_id ${_id} in the DB`);
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
