const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const findReception = require("../../utils/findReception");
const auth = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");
const {Reception} = require("../../models/reception");

router.get("/", [auth, adminMiddleware], async (req, res) => {
  let result = await Reception.findById(req.query.receptionId).select({
    name: 1,
    email: 1,
    username: 1,
  });
  if (!result) return res.status(400).send("User not found");
  res.send(result);
});

router.post("/", async (req, res) => {
  let {userId} = req.body;
  let reception = await findReception(userId);
  if (!reception) return res.status(400).send("UserId and Password doesn't Match");

  let validPassword = await bcrypt.compare(req.body.password, reception.password);
  if (!validPassword) return res.status(400).send("UserId and Password doesn't Match");

  const token = reception.generateAuthToken();
  res.send(token);
});

module.exports = router;
