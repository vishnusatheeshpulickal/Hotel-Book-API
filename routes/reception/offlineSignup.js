const express = require("express");
const router = express.Router();
const validate = require("../../middleware/validate");
const auth = require("../../middleware/auth");
const receptionMiddleware = require("../../middleware/reception");
const {validateOfflineGuest, OfflineGuest} = require("../../models/offlineGuest");

router.get("/", [auth, receptionMiddleware], async (req, res) => {
  let email = await OfflineGuest.findOne({
    email: req.query.userId.toLowerCase(),
  });
  let mobile = await OfflineGuest.findOne({
    phoneNumber: req.query.userId,
  });

  let userId;
  if (email) userId = email._id;
  if (mobile) userId = mobile._id;
  if (mobile || email) return res.send({userId, isGuestExist: true});
  else res.send({userId, isGuestExist: false});
});

router.post("/", [auth, receptionMiddleware, validate(validateOfflineGuest)], async (req, res) => {
  let email = await OfflineGuest.findOne({
    email: req.body.email.toLowerCase(),
  });
  if (email)
    return res.status(400).send({
      property: "email",
      msg: "Email Already Registered",
    });

  let mobile = await OfflineGuest.findOne({
    phoneNumber: req.body.phoneNumber,
  });
  if (mobile)
    return res.status(400).send({
      property: "phoneNumber",
      msg: "Mobile Already Exist",
    });

  req.body.email = req.body.email.toLowerCase();
  const offlineGuest = new OfflineGuest(req.body);
  await offlineGuest.save();
  res.send({userId: offlineGuest._id, isGuestExist: true});
});

module.exports = router;
