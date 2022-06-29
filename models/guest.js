const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Yup = require("yup");

const guestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  username: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 30,
    validate: /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/,
  },
  email: {
    type: String,
    required: true,
    validate: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  },
  address: {
    type: String,
    default: null,
  },
  phoneNumber: {
    type: String,
    minlength: 5,
    maxlength: 50,
    default: null,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 1024,
  },
  resettoken: {
    type: Object,
    default: null,
  },
  bookedHotelDetails: {
    type: Array,
    default: [],
  },
  previousBookedHotelDetails: {
    type: Array,
    default: [],
  },
  reviewedHotelIds: {
    type: Array,
    default: [],
  },
  reviewIds: {
    type: Array,
    default: [],
  },
});

guestSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      username: this.username,
      name: this.name,
      isGuest: true,
      email: this.email,
    },
    process.env.JWT_AUTH_PRIVATE_KEY
  );
  return token;
};

guestSchema.methods.generateResetToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      isGuest: true,
    },
    process.env.JWT_CHANGEPASSWORD_PRIVATE_KEY
  );
  return token;
};

const Guest = mongoose.model("guest", guestSchema);

function validateGuest(data) {
  const schema = Yup.object().shape({
    name: Yup.string().min(2).max(50).required("Name is required").label("Name"),
    email: Yup.string().required("Email is required").email("Email must be valid").label("Email"),
    username: Yup.string()
      .required("Username is required")
      .matches(/^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/, "Invalid Username")
      .label("Username"),
    password: Yup.string().required("Password is required").min(6).max(256).label("Password"),
    confirmPassword: Yup.string().oneOf([Yup.ref("password"), null], "Passwords must match"),
  });
  return schema.validate(data);
}

function validateGuestPassword(data) {
  const schema = Yup.object({
    oldPassword: Yup.string().required().min(6).max(256).label("Old Password"),
    newPassword: Yup.string()
      .notOneOf([Yup.ref("oldPassword"), null], "Old Password Should not be same as new password")
      .required("Password is required")
      .min(6)
      .max(256)
      .label("Password"),
    confirmPassword: Yup.string().oneOf([Yup.ref("newPassword"), null], "Passwords must match"),
  });

  return schema.validate(data);
}

function validateResetGuestPassword(data) {
  const schema = Yup.object({
    newPassword: Yup.string()
      .required("Password is required")
      .min(6)
      .max(256)
      .label("Password"),
    confirmPassword: Yup.string().oneOf([Yup.ref("newPassword"), null], "Passwords must match"),
  });

  return schema.validate(data);
}

exports.Guest = Guest;
exports.validateGuest = validateGuest;
exports.validateGuestPassword = validateGuestPassword;
exports.validateResetGuestPassword = validateResetGuestPassword;
