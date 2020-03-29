const express = require("express");
const cors = require("cors");
require("./db/mongoose");

const UsersRouter = require("./routers/UsersRouter");
const EventsRouter = require("./routers/EventsRouter");
const CorrespondencesRouter = require("./routers/CorrespondencesRouter");

const app = express();
const port = process.env.PORT || 3000;

app.set("port", port);

app.use(express.json());
app.use(cors());
app.all("*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST , OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/", (req, res) => {
  res.send("Wizu");
});
app.use(UsersRouter);
app.use(EventsRouter);
app.use(CorrespondencesRouter);

// add correspondences

app.listen(port, () => {
  console.log("Server is listening on " + port);
});
