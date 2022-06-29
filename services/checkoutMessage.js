const fast2sms = require("fast-two-sms");

module.exports = function (booking, phoneNumber) {
  phoneNumber = phoneNumber.toString();
  if(phoneNumber.length === 12){
    phoneNumber = phoneNumber.substring(2, Infinity)
  }
  if (phoneNumber.charAt(0) == "+") {
    phoneNumber = phoneNumber.substring(3, Infinity);
  } else {
    phoneNumber.substring(2, Infinity);
  }

  console.log(booking.linkReviewId, "bkid");

  let message = `You have successfully checked out your room. 
  Thank You. Please kindly add a review. http://localhost:3000/linkreview/${booking.linkReviewId}`;

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
