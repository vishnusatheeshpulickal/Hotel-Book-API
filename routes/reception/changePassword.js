const express = require("express");
const router = express.Router();
const validate = require("../../middleware/validate");
const auth = require("../../middleware/auth");
const bcrypt = require("bcrypt");
const findAdmin = require("../../utils/findAdmin");
const adminMiddleware = require("../../middleware/admin");
const {validateReceptionPassword} = require("../../models/reception");
const {Reception} = require("../../models/reception");

router.post("/", [auth, adminMiddleware, validate(validateReceptionPassword)], async (req, res) => {
  const reception = await Reception.findById(req.body.receptionId);
  const admin = await findAdmin(req.user.username);

  let validPassword = await bcrypt.compare(req.body.oldPassword, admin.password);
  if (!validPassword)
    return res.status(400).send({
      property: "oldPassword",
      msg: "Admin password is wrong",
    });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

  reception.password = hashedPassword;
  await reception.save();

  const token = reception.generateAuthToken();
  res.send({token, msg: "Password changed successfully"});
});

module.exports = router;
