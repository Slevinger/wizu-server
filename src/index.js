const express = require("express");
const cors = require("cors");

const UsersRouter = require("./routers/UsersRouter");
const EventsRouter = require("./routers/EventsRouter");
const CorrespondencesRouter = require("./routers/CorrespondencesRouter");
require("./db/mongoose");

const app = express();
app.use(express.json());
app.use(cors());
app.all("*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST , OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.use(UsersRouter);
app.use(EventsRouter);
app.use(CorrespondencesRouter);

const port = process.env.PORT || 3000;
// add correspondences

app.listen(port, () => {
  console.log("Server is listening on " + port);
});
