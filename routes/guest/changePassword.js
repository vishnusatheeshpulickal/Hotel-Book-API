const express = require("express");
const router = express.Router();
const validate = require("../../middleware/validate");
const auth = require("../../middleware/auth");
const bcrypt = require("bcrypt");
const findGuest = require("../../utils/findGuest");
const guestMiddleware = require("../../middleware/guest");
const {validateGuestPassword} = require("../../models/guest");

router.post("/", [auth, guestMiddleware, validate(validateGuestPassword)], async (req, res) => {
  const guest = await findGuest(req.user["username"]);
  let validPassword = await bcrypt.compare(req.body.oldPassword, guest.password);

  if (!validPassword)
    return res.status(400).send({
      property: "oldPassword",
      msg: "Old password is wrong",
    });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

  guest.password = hashedPassword;
  await guest.save();
  const token = guest.generateAuthToken();
  res.send({token, msg: "Password changed successfully"});
});

module.exports = router;
