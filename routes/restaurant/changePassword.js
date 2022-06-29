const express = require("express");
const router = express.Router();
const {validateRestaurantPassword} = require("../../models/restaurant");
const validate = require("../../middleware/validate");
const auth = require("../../middleware/auth");
const bcrypt = require("bcrypt");
const findAdmin = require("../../utils/findAdmin");
const adminMiddleware = require("../../middleware/admin");
const {Restaurant} = require("../../models/restaurant");

router.post(
  "/",
  [auth, adminMiddleware, validate(validateRestaurantPassword)],
  async (req, res) => {
    const restaurant = await Restaurant.findById(req.body.restaurantId);
    const admin = await findAdmin(req.user.username);

    let validPassword = await bcrypt.compare(req.body.oldPassword, admin.password);
    if (!validPassword)
      return res.status(400).send({
        property: "oldPassword",
        msg: "Admin password is wrong",
      });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

    restaurant.password = hashedPassword;
    await restaurant.save();

    const token = restaurant.generateAuthToken();
    res.send({token, msg: "Password changed successfully"});
  }
);

module.exports = router;
