const express = require("express");
const router = express.Router();
const {OfflineGuest} = require("../../models/offlineGuest");
const {Booking} = require("../../models/booking");
const {average} = require("average-rating");
const {Review} = require("../../models/review");
const {Hotel} = require("../../models/hotel");
const {Guest} = require("../../models/guest");

router.get("/:id", async (req, res) => {
  const linkReviewId = req.params.id;
  const booking = await Booking.find({
    linkReviewId: linkReviewId,
  });
  if (!booking[0]) return res.status(400).send("Invalid URL");
  const review = await Review.findById(booking[0].reviewId);
  res.send(review);
});

router.post("/:id", async (req, res) => {
  const linkReviewId = req.params.id;
  const booking = await Booking.findOne({linkReviewId});
  if (!booking) return res.status(403).send("You cannot write review! Check your URL.");

  let guest;
  let previousBookedHotelDetails;
  if (booking.bookingMode === "online") {
    guest = await Guest.findById(booking.guestId);
    previousBookedHotelDetails = guest.previousBookedHotelDetails;
  }

  if (booking.bookingMode === "offline") {
    guest = await OfflineGuest.findById(booking.guestId);
    previousBookedHotelDetails = guest.previousBookedHotelDetails;
  }

  let eligibleToReview = previousBookedHotelDetails.includes(booking.hotelId);
  if (!eligibleToReview) return res.status(400).send("You are not elligible to review");

  let reviewedOn = new Date().toLocaleString("en-us", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let date1 = new Date(booking.startingDayOfStay);
  let date2 = new Date(booking?.earlyEndingDayOfStay || booking.endingDayOfStay);
  let diffDays = Math.round((date2 - date1) / (1000 * 60 * 60 * 24), 10);

  req.body.guestId = guest._id;
  req.body.hotelId = booking.hotelId;
  req.body.reviewedOn = reviewedOn;
  req.body.numberOfDays = diffDays + 1;
  req.body.name = guest.name;
  req.body.bookingId = booking._id;

  let review;
  if (booking?.reviewId) {
    review = await Review.findByIdAndUpdate(booking.reviewId, req.body, {new: true});
  } else {
    review = new Review(req.body);
    await review.save();
    await Hotel.findByIdAndUpdate(booking.hotelId, {
      $push: {reviewIds: review._id},
    });
    await Guest.findByIdAndUpdate(booking.guestId, {
      $push: {
        reviewedHotelIds: booking.hotelId,
        reviewIds: review._id,
      },
    });
    await Booking.findByIdAndUpdate(booking._id, {
      reviewId: review._id,
    });
  }

  const rating = [];
  for (let i = 0; i < 5; i++) {
    rating.push(
      await Review.find({
        rating: i + 1,
        hotelId: review.hotelId,
      }).countDocuments()
    );
  }

  await Hotel.findByIdAndUpdate(review.hotelId, {
    $set: {reviewScore: average(rating)},
  });
  res.send(review);
});

module.exports = router;
