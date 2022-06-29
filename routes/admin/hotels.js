const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");
const validate = require("../../middleware/validate");
const validateObjectId = require("../../middleware/validateObjectId");
const findAdmin = require("../../utils/findAdmin");
const createFolder = require("../../utils/createFolder");
const saveImagesandGetPath = require("../../utils/saveImagesandGetPath");
const {retrieveMainPhoto, retrieveOtherPhotos} = require("../../utils/retrieveImages");
const {validateHotel, Hotel} = require("../../models/hotel");

router.get("/", [auth, adminMiddleware], async (req, res) => {
  let hotels;
  const data = await findAdmin(req.user.username);
  if (!data) return res.status(404).send("No hotels found");
  hotels = data.hotels;
  let hotel = await Hotel.find({
    _id: {
      $in: hotels,
    },
  }).select({
    _id: 1,
    hotelName: 1,
    mainPhoto: 1,
    city: 1,
    startingRatePerDay: 1,
    receptionId: 1,
    restaurantId: 1,
    reviewScore: 1,
    description: 1,
  });

  hotel = await retrieveMainPhoto(hotel);

  let hotelsCount = await Hotel.find({
    _id: {
      $in: hotels,
    },
  }).countDocuments();

  let hotelsData = {hotels: hotel, hotelsCount};

  res.send(hotelsData);
});

router.get("/:id", [auth, adminMiddleware, validateObjectId], async (req, res) => {
  let hotel = [await Hotel.findById(req.params.id)];
  if (!hotel[0]) return res.status(404).send("hotel with given id not found");
  hotel = await retrieveMainPhoto(hotel);
  hotel = await retrieveOtherPhotos(hotel);
  res.send(hotel);
});

router.post("/", [auth, adminMiddleware, validate(validateHotel)], async (req, res) => {
  createFolder(req.user.email);
  await saveImagesandGetPath(req);

  let {starRating} = req.body;
  if (starRating) starRating = Number(starRating);
  else starRating = 0;

  req.body.starRating = starRating;
  const hotel = new Hotel(req.body);
  await hotel.save();

  const admin = await findAdmin(req.user.username);
  admin.hotels.push(hotel._id);
  await admin.save();
  res.send(hotel);
});

router.put(
  "/:id",
  [auth, adminMiddleware, validateObjectId, validate(validateHotel)],
  async (req, res) => {
    await saveImagesandGetPath(req);

    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!hotel) return res.status(404).send("hotel with given id not found");
    res.send(hotel);
  }
);

module.exports = router;
