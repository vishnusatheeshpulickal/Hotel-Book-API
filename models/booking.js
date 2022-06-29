const mongoose = require("mongoose");
const Yup = require("yup");

const bookingSchema = new mongoose.Schema({
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  lateStartingDayOfStay: {
    type: String,
    default: null,
    minlength: 8,
    maxlength: 10,
  },
  startingDayOfStay: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 10,
  },
  endingDayOfStay: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 10,
  },
  earlyEndingDayOfStay: {
    type: String,
    default: null,
    minlength: 8,
    maxlength: 10,
  },
  identityProof: {
    type: String,
    default: null,
  },
  identityProofNumber: {
    type: String,
    default: null,
  },
  roomDetails: {
    type: Object,
    required: true,
  },
  restaurantBill: {
    type: Array,
    default: null,
  },
  roomFinalDetails: {
    type: Array,
    default: null,
  },
  additionalCharges: {
    type: Array,
    default: null,
  },
  bookedOn: {
    type: String,
    required: true,
  },
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  bookingMode: {
    type: String,
  },
  hotelBookingId: {
    type: String,
    required: true,
  },
  linkReviewId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "yettostay",
  },
});

function validateBooking(data) {
  const schema = Yup.object().shape({
    phoneNumber: Yup.string().min(5).max(50).required(),
    address: Yup.string().min(8, "Too short").max(255, "Too Long!").required("Required"),
    identityProofNumber: Yup.string().max(30).required("Required"),
    identityProof: Yup.mixed().required("Identity Proof image is required"),
  });
  return schema.validate(data);
}

const Booking = mongoose.model("booking", bookingSchema);

exports.Booking = Booking;
exports.validateBooking = validateBooking;
