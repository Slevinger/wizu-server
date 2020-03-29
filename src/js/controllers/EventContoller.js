const Event = require("../models/EventModel");
const { setEventImage } = require("../utils/fireBase");

module.exports = {
  setEventImage: async (req, res, next) => {
    console.log("Set Profile image");
    const { file } = req;
    if (!file) {
      throw errorStatusCode("No file was sent", 400);
    }
    const { event_id } = req.context;
    const event = Event.findById(event_id);
    setEventImage(event, file)
      .then(async url => {
        event.image_url = format(url);
        console.log(`${format(url)}?alt=media`);
        await event.save();
        res.status(200).send({ data: format(url) });
      })
      .catch(error => {
        next(error);
      });
  }
};
