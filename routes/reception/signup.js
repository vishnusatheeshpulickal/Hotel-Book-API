const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
const validate = require("../../middleware/validate");
const auth = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");
const Yup = require("yup");
const {validateReception, Reception} = require("../../models/reception");
const {Hotel} = require("../../models/hotel");

router.post("/", [validate(validateReception)], async (req, res) => {
  let hotel = await Hotel.findById(req.body.hotelId);
  if (!hotel)
    return res.status(400).send({
      property: "toast",
      msg: "There is no hotel with given ID",
    });

  let hotelId = await Reception.findOne({
    hotelId: req.body.hotelId,
  });
  if (hotelId)
    return res.status(400).send({
      property: "toast",
      msg: "Reception account already created",
    });

  let email = await Reception.findOne({
    email: req.body.email.toLowerCase(),
  });
  if (email)
    return res.status(400).send({
      property: "email",
      msg: "Email Already Registered",
    });

  let username = await Reception.findOne({
    username: req.body.username.toLowerCase(),
  });
  if (username)
    return res.status(400).send({
      property: "username",
      msg: "Username Already Taken",
    });

  if (req.body.password !== req.body.confirmPassword)
    return res.status(400).send({
      property: "confirmPassword",
      msg: "Passwords doesn't Match'",
    });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  req.body.password = hashedPassword;
  req.body.email = req.body.email.toLowerCase();
  req.body.username = req.body.username.toLowerCase();

  let receptionData = _.pick(req.body, ["name", "email", "username", "password", "hotelId"]);
  const reception = new Reception(receptionData);
  await reception.save();
  await Hotel.findByIdAndUpdate(req.body.hotelId, {
    receptionId: reception._id,
  });
  const token = reception.generateAuthToken();
  res.send(token);
});

router.put("/", [auth, adminMiddleware], async (req, res) => {
  const nameSchema = Yup.object().shape({
    name: Yup.string().min(2).max(50).required("Name is required").label("Name"),
  });

  const usernameSchema = Yup.object().shape({
    username: Yup.string()
      .required("Username is required")
      .matches(/^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/, "Invalid Username")
      .label("Username"),
  });

  let newUsername = req.body.username?.toLowerCase();
  let name = req.body.name;

  if (newUsername) {
    usernameSchema
      .validate({
        username: newUsername,
      })
      .then(async () => {
        let username = await Reception.findOne({
          username: newUsername,
        });
        if (username)
          return res.status(400).send({
            property: "username",
            msg: "Username Already Taken",
          });
        await Reception.findByIdAndUpdate(req.body.receptionId, {
          username: newUsername,
        });
        res.send(
          await Reception.findById(req.body.receptionId).select({
            name: 1,
            email: 1,
            username: 1,
          })
        );
      })
      .catch(error => {
        return res.status(400).send({
          property: "username",
          msg: error.errors.toString(),
        });
      });
  }

  if (name) {
    nameSchema
      .validate({
        name,
      })
      .then(async () => {
        await Reception.findByIdAndUpdate(req.body.receptionId, {
          name,
        });
        res.send(
          await Reception.findById(req.body.receptionId).select({
            name: 1,
            email: 1,
            username: 1,
          })
        );
      })
      .catch(error => {
        return res.status(400).send({
          property: "name",
          msg: error.errors.toString(),
        });
      });
  }
});
module.exports = router;
