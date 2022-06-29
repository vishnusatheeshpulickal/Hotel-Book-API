const fast2sms = require("fast-two-sms");
const {Hotel}=require("../models/hotel")

module.exports = async function (booking, phoneNumber) {

  const {hotelName} =await Hotel.findById(booking.hotelId).select({hotelName:1})

  phoneNumber = phoneNumber.toString();
  if(phoneNumber.length === 12){
    phoneNumber = phoneNumber.substring(2, Infinity)
  }
  if (phoneNumber.charAt(0) == "+") {
    phoneNumber = phoneNumber.substring(3, Infinity);
  } else {
    phoneNumber.substring(2, Infinity);
  }

  let message = `You have successfully checkedin to your room at ${hotelName}. 
  Your Booking ID is ${booking.hotelBookingId}. Don't share Booking ID with anyone until you complete your stay.
  Your room numbers are ${booking.roomFinalDetails.map(data => data.roomNumber + ", ")}`;

  fast2sms
    .sendMessage({
      authorization: process.env.MESSAGE_API_KEY,
      message,
      numbers: [phoneNumber],
    })
    .then(function (data) {
      console.log("data................", data);
    })
    .catch(function (error) {
      console.log("err.................", error);
    });
};
