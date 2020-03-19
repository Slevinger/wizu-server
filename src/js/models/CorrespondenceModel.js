const mongoose = require("mongoose");
const Event = require("./EventModel");
const User = require("./UserModel");

const CorrespondenceSchema = require("./schemas/Correspondence");

CorrespondenceSchema.pre("save", async function(next) {
  const correspondence = this;
  const event = await Event.findById(correspondence.event_id);
  const user = await User.findOne({ email: correspondence.email });

  if (correspondence.isModified("answer")) {
    switch (correspondence.answer) {
      case "confirm":
        user.events = user.events.concat(event._id);
        event.users = event.users.concat(user._id);
        await Promise.all([user.save(), event.save()]);

        console.log("confirm");
        break;
      default:
        const eventIndex = user.events.findIndex(
          _id => _id.toString() === event._id.toString()
        );
        const userIndex = event.users.findIndex(
          _id => _id.toString() === user._id.toString()
        );
        user.events.splice(eventIndex, 1);
        event.users.splice(userIndex, 1);

        await Promise.all([user.save(), event.save()]);

        console.log(correspondence.answer);
        break;
    }
    correspondence.timeStamp = Date.now();
  }
  next();
});
CorrespondenceSchema.post("remove", correspondence => {
  console.log(correspondence);
});

const Correspondence = mongoose.model("Correspondence", CorrespondenceSchema);

module.exports = Correspondence;
