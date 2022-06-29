const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const findGuest = require("../../utils/findGuest");
const validate = require("../../middleware/validate");
const resetPasswordMail = require("../../services/resetPasswordMail");
const {validateResetGuestPassword} = require("../../models/guest");
const {encrypt, decrypt} = require("../../utils/encryption");

router.post("/", async (req, res) => {
  let {userId} = req.body;
  let guest = await findGuest(userId);
  if (!guest)
    return res.status(400).send({
      property: "userId",
      msg: "There is no user with given email id or username",
    });

  let resetToken = guest.generateResetToken();
  let encryptedResetToken = encrypt(resetToken);
  guest.resettoken = encryptedResetToken;
  await guest.save();
  resetPasswordMail(guest["email"], resetToken, guest?.name);
  res.send("Link Sent Successfully");
});

router.put("/:token", validate(validateResetGuestPassword), async (req, res) => {
  let token = req.params.token;
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_CHANGEPASSWORD_PRIVATE_KEY);
  } catch (ex) {
    return res.status(400).send("This link is invalid.");
  }

  let guest = await findGuest(decoded.email);
  if (!guest) return res.status(400).send("Something went wrong. Try again");
  if (!guest.resettoken) return res.status(400).send("This link is invalid");

  let decryptedResetToken = decrypt(guest.resettoken);
  if (token !== decryptedResetToken) return res.status(400).send("Something went wrong. Try again");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

  guest.password = hashedPassword;
  guest.resettoken = null;
  await guest.save();
  res.send("Password changed successfully");
});

module.exports = router;
