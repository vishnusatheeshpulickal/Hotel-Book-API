const express = require("express");
const router = express.Router();
const _ = require("lodash");
const guestMiddleware = require("../../middleware/guest");
const auth = require("../../middleware/auth");
const getCheckoutDate = require("../../utils/getCheckoutDate");
const {retrieveMainPhotobyPath, retrieveMainPhoto} = require("../../utils/retrieveImages");
const {RoomBoy} = require("../../models/roomBoy");
const {Booking} = require("../../models/booking");
const {Guest} = require("../../models/guest");
const {Hotel} = require("../../models/hotel");
const {Room} = require("../../models/room");

router.get("/", [auth, guestMiddleware], async (req, res) => {
  let finalData = [];
  let bookings;
  if (req.query.isStayCompleted === "true") {
    bookings = await Booking.find({
      guestId: req.user._id,
      status: "checkedout",
    }).lean();
  } else {
    bookings = await Booking.find({guestId: req.user._id}).where("status").ne("checkedout").lean();
  }

  if (!bookings[0]) return res.send("No bookings found");

  _.each(bookings, async (booking, index) => {
    const hotel = await Hotel.findById(booking.hotelId);
    bookings[index].mainPhoto = await retrieveMainPhotobyPath(hotel.mainPhoto);
    bookings[index].address = hotel.address;
    bookings[index].rating = hotel.reviewScore;
    bookings[index].hotelName = hotel.hotelName;

    totalNoOfExtraBeds = 0;
    checkoutAdditionalCharges = 0;
    restaurantBillAmount = 0;
    additionalCharges = 0;
    totalPrice = 0;
    totalBeds = 0;
    totalGuests = 0;
    totalRooms = 0;
    for (let [key, value] of Object.entries(booking.roomDetails)) {
      let objectValues = [];
      for (const [key1, value1] of Object.entries(value)) {
        objectValues.push(value1);
      }
      totalPrice += objectValues[0] * objectValues[1];
      totalBeds += objectValues[0] * objectValues[2];
      totalGuests += objectValues[0] * objectValues[3];
      totalRooms += objectValues[0];
    }

    if (booking.roomFinalDetails) {
      booking.roomFinalDetails.map(details => {
        if (details.selectedExtraBed) {
          totalNoOfExtraBeds += details.selectedExtraBed;
        }
      });
    }

    if (booking.restaurantBill) {
      booking.restaurantBill.map(item => {
        restaurantBillAmount += item.itemPrice * item.itemQuantity;
      });
    }

    if (booking.additionalCharges) {
      booking.additionalCharges.map(item => {
        checkoutAdditionalCharges += Number(item.itemPrice);
      });
    }

    bookings[index].additionalCharges =
      totalNoOfExtraBeds * hotel.pricePerExtraBed +
      restaurantBillAmount +
      checkoutAdditionalCharges;
    bookings[index].totalPrice = totalPrice;
    bookings[index].totalBeds = totalBeds;
    bookings[index].totalGuests = totalGuests;
    bookings[index].totalRooms = totalRooms;
    bookings[index].startingDayOfStay = booking[index]?.lateStartingDayOfStay
      ? new Date(bookings[index]?.lateStartingDayOfStay).toLocaleString("en-us", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : new Date(bookings[index].startingDayOfStay).toLocaleString("en-us", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
    bookings[index].endingDayOfStay = booking[index]?.earlyEndingDayOfStay
      ? new Date(getCheckoutDate(bookings[index]?.earlyEndingDayOfStay)).toLocaleString("en-us", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : new Date(getCheckoutDate(bookings[index].endingDayOfStay)).toLocaleString("en-us", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
    finalData.push(bookings[index]);
    if (index == bookings.length - 1) {
      sendData();
    }
  });

  function sendData() {
    res.send(finalData);
  }
});

router.get("/guest", [auth, guestMiddleware], async (req, res) => {
  const {roomIds} = req.query;
  let finalRoomsData = [];
  let rooms = [await Room.find().where("_id").in(roomIds).lean()];

  for (let room of rooms) {
    finalRoomsData.push(await retrieveMainPhoto(room));
  }

  return res.send(_.flattenDeep(finalRoomsData));
});

router.get("/downloadInvoice/:id", [auth, guestMiddleware], async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (booking.status !== "checkedout") return res.status(400).send("Something went wrong");
  let hotel = await Hotel.findById(booking.hotelId);
  let price = 0;
  let accomodationTotal = 0;
  let extraBedTotal = 0;
  let extraAdditionalCharges = 0;
  let inputFields = {items: []};
  let roomDetails = [];
  for (let data of booking.roomFinalDetails) {
    const room = await Room.find().where("roomNumbers").in(data.roomNumber);
    let object = {};
    const roomBoy = await RoomBoy.findById(data?.roomBoyId);
    object["roomBoy"] = roomBoy?.name;
    object["roomType"] = data?.roomType;
    object["roomNumber"] = data?.roomNumber;
    object["guests"] = Number(data?.adults) + Number(data?.children);
    object["adults"] = Number(data?.adults);
    object["children"] = Number(data?.children);
    roomDetails.push(object);
    accomodationTotal += room[0].basePricePerNight;
    extraBedTotal += data.selectedExtraBed * hotel.pricePerExtraBed;
  }

  let restaurantBillAmount = 0;

  booking.restaurantBill.map(item => {
    restaurantBillAmount += item.itemPrice * item.itemQuantity;
  });

  booking?.additionalCharges?.map(additionalCharge => {
    let object = {};
    object["itemName"] = additionalCharge.itemName;
    object["itemPrice"] = Number(additionalCharge.itemPrice);
    inputFields.items.push(object);
    extraAdditionalCharges += Number(additionalCharge.itemPrice);
  });

  price += restaurantBillAmount + accomodationTotal + extraBedTotal + extraAdditionalCharges;

  let guest = await Guest.findById(booking.guestId).lean();
  if (!guest) guest = await OfflineGuest.findById(booking.guestId).lean();
  guest["price"] = price;
  guest["restaurantBillAmount"] = restaurantBillAmount;
  guest["accomodationTotal"] = accomodationTotal;
  guest["extraBedTotal"] = extraBedTotal;
  guest["inputFields"] = inputFields;
  guest["endingDayOfStay"] = booking?.earlyEndingDayOfStay || booking?.endingDayOfStay;
  guest["roomDetails"] = roomDetails;
  res.send(guest);
});

module.exports = router;
