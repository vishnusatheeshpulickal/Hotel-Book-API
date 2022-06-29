const {Guest} = require("../models/guest");

module.exports = async function (userId) {
  let user;
  userId = userId.toLowerCase();

  user = await Guest.findOne({
    email: userId,
  });

  if (!user) {
    user = await Guest.findOne({
      username: userId,
    });
  }
  return user;
};
