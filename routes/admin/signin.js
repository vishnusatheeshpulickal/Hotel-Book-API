const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const findAdmin = require("../../utils/findAdmin");
const auth = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");
const {Admin} = require("../../models/admin");

router.get("/", [auth, adminMiddleware], async (req, res) => {
  let result = await Admin.findById(req.user._id).select({
    name: 1,
    email: 1,
    username: 1,
  });
  if (!result) return res.status(400).send("User not found");
  res.send(result);
});

router.post("/", async (req, res) => {
  let {userId} = req.body;
  let admin = await findAdmin(userId);

  if (!admin) return res.status(400).send("UserId and Password doesn't Match");

  let validPassword = await bcrypt.compare(req.body.password, admin.password);
  if (!validPassword) return res.status(400).send("UserId and Password doesn't Match");

  const token = admin.generateAuthToken();
  res.send(token);
});

module.exports = router;
