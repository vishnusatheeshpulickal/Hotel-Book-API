const fast2sms = require("fast-two-sms");

module.exports = function (bookingId, phoneNumber) {
  phoneNumber = phoneNumber.toString();
  if(phoneNumber.length === 12){
    phoneNumber = phoneNumber.substring(2, Infinity)
  }
  if (phoneNumber.charAt(0) == "+") {
    phoneNumber = phoneNumber.substring(3, Infinity);
  } else {
    phoneNumber.substring(2, Infinity);
  }
  let message = `You have successfully booked your room on Adithya Group of Hotels. 
  Your Booking ID is ${bookingId}. Don't share Booking ID with anyone until you complete your stay. `;

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
