const mongoose = require("mongoose");
const Yup = require("yup");

const roomBoySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
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
    min: 1,
    max: 50,
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function (v) {
        return v && !Object.is(Number(v), NaN) && v.length === 12;
      },
      message: "This is not a valid Phone Number",
    },
    required: true,
  },
  aadharNumber: {
    type: String,
    validate: {
      validator: function (v) {
        return v && !Object.is(Number(v), NaN) && v.length === 12;
      },
      message: "This is not a valid Aadhar Number",
    },
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  currentHotelId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

const RoomBoy = mongoose.model("roomboy", roomBoySchema);

function validateRoomBoy(data) {
  const schema = Yup.object().shape({
    name: Yup.string().min(1).max(50).required(),
    phoneNumber: Yup.string()
      .required()
      .length(12)
      .matches(/^[0-9]+$/, "Mobile number must include only numbers")
      .label("Mobile Number"),
    address: Yup.string().required().min(8).max(255),
    city: Yup.string().required().min(1).max(50),
    aadharNumber: Yup.string()
      .required()
      .length(12)
      .matches(/^[0-9]+$/, "Aadhar Number must include only numbers")
      .label("Aadhar Number"),
    photo: Yup.mixed().required(),
    currentHotelId: Yup.string().required(),
  });
  return schema.validate(data);
}

exports.RoomBoy = RoomBoy;
exports.validateRoomBoy = validateRoomBoy;
