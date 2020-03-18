const mongoose = require("mongoose");
const MONGO_URL = `mongodb://localhost:27017/wizu-db`;

mongoose.connect(MONGO_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true
});
