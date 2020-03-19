const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is not a valid email");
      }
    }
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate(value) {
      if (!validator.isAlphanumeric(value)) {
        throw new Error("Username must be Alphanumeric");
      }
    }
  },
  friends: {
    type: [Schema.ObjectId],
    default: [],
    ref: "User"
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6
  },
  profileImage: {
    type: String
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      }
    }
  ],
  events: {
    type: [Schema.ObjectId],
    default: [],
    ref: "Event"
  },
  correspondences: {
    type: [Schema.ObjectId],
    default: [],
    ref: "Correspondence"
  },
  action_items: {
    type: [Schema.ObjectId],
    default: []
  }
});

UserSchema.pre("save", async function(next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
// TODO: split model and CRUD methods to 2 seperate files
module.exports = UserSchema;