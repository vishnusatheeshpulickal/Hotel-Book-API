const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Yup = require("yup");

const receptionSchema = new mongoose.Schema({
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
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

receptionSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      username: this.username,
      isReception: true,
      email: this.email,
      hotelId: this.hotelId,
      name: this.name,
    },
    process.env.JWT_AUTH_PRIVATE_KEY
  );
  return token;
};

const Reception = mongoose.model("reception", receptionSchema);

function validateReception(data) {
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

function validateReceptionPassword(data) {
  const schema = Yup.object({
    oldPassword: Yup.string().required().min(6).max(256).label("Admin Password"),
    newPassword: Yup.string()
      .notOneOf([Yup.ref("oldPassword"), null], "Admin Password Should not be same as new password")
      .required("Password is required")
      .min(6)
      .max(256)
      .label("Password"),
    confirmPassword: Yup.string().oneOf([Yup.ref("newPassword"), null], "Passwords must match"),
  });

  return schema.validate(data);
}

exports.Reception = Reception;
exports.validateReception = validateReception;
exports.validateReceptionPassword = validateReceptionPassword;
