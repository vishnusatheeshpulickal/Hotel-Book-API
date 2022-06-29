const {Decimal128} = require("mongoose");
const mongoose = require("mongoose");
const Yup = require("yup");

const hotelSchema = new mongoose.Schema({
  hotelName: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
  },
  starRating: {
    type: Number,
    enum: [0, 1, 2, 3, 4, 5],
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function (v) {
        return v && !Object.is(Number(v), NaN) && v.length === 12;
      },
      message: "This is not a valid mobile number",
    },
    required: true,
  },
  landLine: {
    type: String,
    validate: {
      validator: function (v) {
        return v && !Object.is(Number(v), NaN) && v.length === 11;
      },
      message: "This is not a valid landline number",
    },
    required: true,
  },
  email: {
    type: String,
    required: true,
    validate: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  },
  address: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 255,
  },
  city: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
  },
  postalCode: {
    type: String,
    validate: {
      validator: function (v) {
        return v && !Object.is(Number(v), NaN) && v.length === 6;
      },
      message: "This is not a valid postal code",
    },
    required: true,
  },
  parking: {
    type: Boolean,
    required: true,
  },
  restaurant: {
    type: Boolean,
    required: true,
  },
  description: {
    type: String,
    required: true,
    minlength: 120,
    maxlength: 160,
  },
  facilities: {
    type: Array,
    default: [],
  },
  extraBed: {
    type: Boolean,
    required: true,
  },
  noOfExtraBeds: {
    type: Number,
    min: 1,
    max: 4,
    default: null,
  },
  pricePerExtraBed: {
    type: Number,
    min: 0,
    max: 10000,
    default: null,
  },
  startingRatePerDay: {
    type: Number,
    required: true,
    min: 0,
    max: 2500000,
    default: 0,
  },
  mainPhoto: {
    type: String,
    required: true,
  },
  photos: {
    type: Array,
  },
  checkInStart: {
    type: String,
    required: true,
  },
  checkInEnd: {
    type: String,
    required: true,
  },
  checkOutStart: {
    type: String,
    required: true,
  },
  checkOutEnd: {
    type: String,
    required: true,
  },
  allowPets: {
    type: Boolean,
    required: true,
  },
  reviewScore: {
    type: Decimal128,
    default: 0,
  },
  reviewIds: {
    type: Array,
    default: [],
  },
  hotelRooms: {
    type: Array,
    default: [],
  },
  receptionId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
});

const Hotel = mongoose.model("hotel", hotelSchema);

function validateHotel(data) {
  const schema = Yup.object().shape({
    hotelName: Yup.string().min(1).max(50).required(),
    starRating: Yup.string().oneOf(["", "1", "2", "3", "4", "5"]).nullable(),
    phoneNumber: Yup.string()
      .required()
      .length(12)
      .matches(/^[0-9]+$/, "Mobile number must include only numbers"),
    landLine: Yup.string()
      .required()
      .length(11)
      .matches(/^[0-9]+$/, "Land Line number must include only numbers"),
    email: Yup.string().required("Email is required").email("Email must be valid").label("Email"),
    address: Yup.string().required().min(8).max(255),
    description: Yup.string().required().min(120).max(160),
    city: Yup.string().required().min(1).max(50),
    postalCode: Yup.string()
      .required()
      .length(6)
      .matches(/^[0-9]+$/, "Postal code must include only numbers"),
    parking: Yup.boolean().required(),
    restaurant: Yup.boolean().required(),
    facilities: Yup.array(),
    extraBed: Yup.boolean().required(),
    noOfExtraBeds: Yup.number().min(1).max(4),
    pricePerExtraBed: Yup.number().min(0).max(10000).nullable(),
    mainPhoto: Yup.mixed().required(),
    photos: Yup.array().nullable(),
    checkInStart: Yup.string().required(),
    checkInEnd: Yup.string().required(),
    checkOutStart: Yup.string().required(),
    checkOutEnd: Yup.string().required(),
    allowPets: Yup.boolean().required(),
  });
  return schema.validate(data);
}

exports.Hotel = Hotel;
exports.validateHotel = validateHotel;
