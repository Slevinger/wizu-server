const UserSchema = require("./schemas/User");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

UserSchema.statics.findByCredentials = async ({ username, password }) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error("unabel to login");
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("wrong credentials");
  }
  return user;
};

UserSchema.methods.removeCorrespondence = async function(_id) {
  const user = this;
  const index = user.correspondences.indexOf(_id);
  if (index >= 0) {
    user.correspondences.splice(index, 1);
  }
};

UserSchema.methods.removeEvent = async function(_id) {
  const user = this;
  const index = user.events.indexOf(_id);
  if (index >= 0) {
    user.events.splice(index, 1);
  }
};

UserSchema.methods.generateAuthToken = async function() {
  const user = this;
  const _id = user._id.toString();
  const token = jwt.sign(
    { _id },
    "youcandieahearoorlivelongenoughtoseeyourselfbecomeavillen"
  );
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
