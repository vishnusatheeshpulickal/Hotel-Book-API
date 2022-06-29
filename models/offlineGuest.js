const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Yup = require("yup");

const offlineGuestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    validate: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  },
  bookedHotelDetails: {
    type: Array,
    default: [],
  },
  previousBookedHotelDetails: {
    type: Array,
    default: [],
  },
  address: {
    type: String,
    default: null,
  },
  phoneNumber: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
});

offlineGuestSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      username: this.username,
      name: this.name,
      isGuest: true,
    },
    process.env.JWT_AUTH_PRIVATE_KEY
  );
  return token;
};

const OfflineGuest = mongoose.model("offlineguest", offlineGuestSchema);

function validateOfflineGuest(data) {
  const schema = Yup.object().shape({
    name: Yup.string().min(2).max(50).required("Name is required").label("Name"),
    email: Yup.string().email("Email must be valid").nullable().label("Email"),
    phoneNumber: Yup.string().required().min(5).max(50),
  });
  return schema.validate(data);
}

exports.OfflineGuest = OfflineGuest;
exports.validateOfflineGuest = validateOfflineGuest;
