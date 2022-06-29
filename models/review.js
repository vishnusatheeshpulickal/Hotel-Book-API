const mongoose = require("mongoose");
const Yup = require("yup");

const reviewSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5],
  },
  reviewedOn: {
    type: String,
    required: true,
  },
  numberOfDays: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

const Review = mongoose.model("review", reviewSchema);

function validateReview(data) {
  const schema = Yup.object().shape({
    review: Yup.string().min(2).max(100000).required(),
    rating: Yup.number().required().oneOf([1, 2, 3, 4, 5]),
  });
  return schema.validate(data);
}

exports.Review = Review;
exports.validateReview = validateReview;
