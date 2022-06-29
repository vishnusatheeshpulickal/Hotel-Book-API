const express = require("express");
const router = express.Router();
const {Hotel} = require("../../models/hotel");

router.get("/", async (req, res) => {
  let hotel = await Hotel.find().where("hotelRooms").exists(true).ne([]).select({city: 1});
  if (!hotel) return res.status(404).send("No hotels found found");
  res.send(hotel);
});

module.exports = router;
