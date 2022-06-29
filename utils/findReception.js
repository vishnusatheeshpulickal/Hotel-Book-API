const {Reception} = require("../models/reception");

module.exports = async function (userId) {
  let user;
  userId = userId.toLowerCase();

  user = await Reception.findOne({
    email: userId,
  });

  if (!user) {
    user = await Reception.findOne({
      username: userId,
    });
  }
  return user;
};
