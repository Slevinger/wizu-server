const mongoose = require("mongoose");
const Event = require("./EventModel");
const User = require("./UserModel");

const CorrespondenceSchema = require("./schemas/Correspondence");

CorrespondenceSchema.pre("save", async function(next) {
  const correspondence = this;
  const {
    correspondence_type: type,
    answer,
    user_id,
    trigger_user_id,
    event_id
  } = correspondence;
  if (correspondence.isModified("answer")) {
    const me = await User.findOne({ _id: user_id });
    const triggerUser = await User.findOne({ _id: trigger_user_id });
    try {
      switch (type) {
        case "FRIEND_REQ":
          console.log("friend Req");
          switch (answer) {
            case "confirm":
              me.friends = me.friends.concat(triggerUser._id);
              triggerUser.friends = triggerUser.friends.concat(me._id);
              break;
            default:
              triggerUser.friends = triggerUser.friends.filter(
                _id => _id.toString() !== me._id.toString()
              );

              me.friends = me.friends.filter(
                _id => _id.toString() !== triggerUser._id.toString()
              );
              break;
          }
          await Promise.all([me.save(), triggerUser.save()]);

          break;
        case "RSVP":
          const event = await Event.findById(event_id);
          switch (answer) {
            case "confirm":
              me.events = me.events.concat(event._id);
              event.users = event.users.concat(user._id);
              await Promise.all([me.save(), event.save()]);

              console.log("confirm");
              break;
            default:
              const eventIndex = me.events.findIndex(
                _id => _id.toString() === event._id.toString()
              );
              const userIndex = event.users.findIndex(
                _id => _id.toString() === me._id.toString()
              );
              me.events.splice(eventIndex, 1);
              event.users.splice(userIndex, 1);

              await Promise.all([me.save(), event.save()]);

              console.log(correspondence.answer);
              break;
          }
        default:
          break;
      }
    } catch (err) {
      console.log(err);
    } finally {
      correspondence.timeStamp = Date.now();
      next();
    }
  } else {
    next();
  }
});

CorrespondenceSchema.post("remove", correspondence => {
  console.log(correspondence);
});

const Correspondence = mongoose.model("Correspondence", CorrespondenceSchema);

module.exports = Correspondence;
