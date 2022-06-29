const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const findGuest = require("../../utils/findGuest");
const auth = require("../../middleware/auth");
const guestMiddleware = require("../../middleware/guest");
const {Guest} = require("../../models/guest");

router.get("/", [auth, guestMiddleware], async (req, res) => {
  let result = await Guest.findById(req.user._id).select({
    name: 1,
    email: 1,
    username: 1,
  });
  if (!result) return res.status(400).send("User not found");
  res.send(result);
});

router.post("/", async (req, res) => {
  let {userId} = req.body;
  let guest = await findGuest(userId);
  if (!guest) return res.status(400).send("UserId and Password doesn't Match");

  let validPassword = await bcrypt.compare(req.body.password, guest.password);
  if (!validPassword) return res.status(400).send("UserId and Password doesn't Match");

  const token = guest.generateAuthToken();
  res.send(token);
});

module.exports = router;
