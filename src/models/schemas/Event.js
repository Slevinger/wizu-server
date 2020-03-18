const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EventSchema = new Schema({
  name: {
    type: String,
    trim: true,
    minlength: 4,
    required: true
  },
  description: {
    type: String,
    trim: true,
    required: true
  },
  date: {
    type: Date,
    validate(value) {
      if (value < new Date()) {
        throw new Error("The Event allready accured");
      }
    }
  },
  users: {
    type: [String],
    default: []
  },
  location: {
    type: Object
  },
  event_nature: {
    type: String,
    required: true,
    trim: true
  },
  todo_lists: {
    type: [Schema.ObjectId],
    default: []
  },
  // stickey_notes: [],
  admins: {
    type: [String],
    required: true,
    default: []
  },
  correspondences: {
    type: [Schema.ObjectId],
    default: []
  },
  image_url: {
    type: String
  }
  // suervyes: [],
  // budget: null
});

module.exports = EventSchema;
