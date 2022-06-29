const {Restaurant} = require("../models/restaurant");

module.exports = async function (userId) {
  let user;
  userId = userId.toLowerCase();

  user = await Restaurant.findOne({
    email: userId,
  });

  if (!user) {
    user = await Restaurant.findOne({
      username: userId,
    });
  }
  return user;
};
