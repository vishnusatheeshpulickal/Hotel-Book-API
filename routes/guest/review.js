const express = require("express");
const router = express.Router();
const guestMiddleware = require("../../middleware/guest");
const auth = require("../../middleware/auth");
const validateObjectId = require("../../middleware/validateObjectId");
const {Review} = require("../../models/review");

router.get("/:id", [auth, guestMiddleware, validateObjectId], async (req, res) => {
  const review = await Review.findById(req.params.id);
  res.send(review);
});

module.exports = router;
