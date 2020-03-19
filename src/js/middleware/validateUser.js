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
      return res.status(401).send({ error: "user not found" });
      throw new Error();
    }
    req.token = token;
    req.user = user.toJSON();
    next();
  } catch (err) {
    res.status(401).send({ error: "please authenticate" });
  }
};

module.exports = validateUser;
