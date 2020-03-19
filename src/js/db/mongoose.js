const mongoose = require("mongoose");
const MONGO_URL = `mongodb://localhost:27017/`;
const PROD_MONGO_URL = `mongodb://slevinger:lev1nger@ds143039.mlab.com:43039/heroku_vcj52z56`;

mongoose.connect(PROD_MONGO_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  dbName: "heroku_vcj52z56"
});

console.log(mongoose);
mongoose.connection.on("open", err => {
  if (err) console.log("Error connecting to our mongo database");
  console.log("Connected to mongo database successfully");
});
