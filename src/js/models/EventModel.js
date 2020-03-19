const EventSchema = require("./schemas/Event");
const mongoose = require("mongoose");

EventSchema.post("remove", event => {
  console.log(event);
});

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;
