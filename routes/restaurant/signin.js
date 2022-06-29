const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const findRestaurant = require("../../utils/findRestaurant");
const auth = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");
const {Restaurant} = require("../../models/restaurant");

router.get("/", [auth, adminMiddleware], async (req, res) => {
  let result = await Restaurant.findById(req.query.restaurantId).select({
    name: 1,
    email: 1,
    username: 1,
  });

  if (!result) return res.status(400).send("User not found");
  res.send(result);
});

router.post("/", async (req, res) => {
  let {userId} = req.body;
  let restaurant = await findRestaurant(userId);
  if (!restaurant) return res.status(400).send("UserId and Password doesn't Match");

  let validPassword = await bcrypt.compare(req.body.password, restaurant.password);
  if (!validPassword) return res.status(400).send("UserId and Password doesn't Match");

  const token = restaurant.generateAuthToken();
  res.send(token);
});

module.exports = router;
