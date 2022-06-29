const mongoose = require("mongoose");

module.exports = function () {
  mongoose
    .connect(process.env.MONGODB_KEY, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    })
    .then(() => console.log("connected to database"))
    .catch(err => console.log(err));
};
