const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const validateUser = async function(req, res, next) {
  try {
    const token = req.header("Authorization").replace("Barear ", "");
    const decoded = jwt.verify(
      token,
      "youcandieahearoorlivelongenoughtoseeyourselfbecomeavillen"
    );
    // TODO: if jwt unothrized trhow 401 and 403 for forbidden
    const { _id } = decoded;
    const user = await User.findOne(
      { _id, "tokens.token": token },
      { password: 0 }
    );
    if (!user) {
      return res.status(401).send({ data: { message: "user not found" } });
    }
    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send({ data: { message: "please authenticate" } });
  }
};

module.exports = validateUser;
