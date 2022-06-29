const express = require("express");
const router = express.Router();
const _ = require("lodash");
const mongoose = require("mongoose");
const receptionMiddleware = require("../../middleware/reception");
const auth = require("../../middleware/auth");
const getDays = require("../../utils/getDays");
const days = require("days-in-a-row");
const JSJoda = require("js-joda");
const convertBase64toImage = require("../../utils/convertBase64toImage");
const createFolder = require("../../utils/createFolder");
const validate = require("../../middleware/validate");
const getCheckoutDate = require("../../utils/getCheckoutDate");
const bookedMail = require("../../services/bookedMail");
const bookedMessage = require("../../services/bookedMessage");
const checkinMail = require("../../services/checkinMail");
const checkinMessage = require("../../services/checkinMessage");
const checkoutMail = require("../../services/checkoutMail");
const checkoutMessage = require("../../services/checkoutMessage");
const {retrieveMainPhotobyPath, retrieveMainPhoto} = require("../../utils/retrieveImages");
const {Booking, validateBooking} = require("../../models/booking");
const {OfflineGuest} = require("../../models/offlineGuest");
const {RoomBoy} = require("../../models/roomBoy");
const {Guest} = require("../../models/guest");
const {Hotel} = require("../../models/hotel");
const {Room} = require("../../models/room");

router.get("/", [auth, receptionMiddleware], async (req, res) => {
  let finalData = [];
  let bookings;

  if (req.query.isStayCompleted === "true") {
    bookings = await Booking.find({
      guestId: req.user._id,
      isStayCompleted: true,
    }).lean();
  } else {
    bookings = await Booking.find({
      guestId: req.user._id,
      isStayCompleted: false,
    }).lean();
  }

  _.each(bookings, async (booking, index) => {
    const hotel = await Hotel.findById(booking.hotelId);
    bookings[index].mainPhoto = await retrieveMainPhotobyPath(hotel.mainPhoto);
    bookings[index].address = hotel.address;
    bookings[index].rating = hotel.reviewScore;
    bookings[index].hotelName = hotel.hotelName;

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
    bookings[index].totalPrice = totalPrice;
    bookings[index].totalBeds = totalBeds;
    bookings[index].totalGuests = totalGuests;
    bookings[index].totalRooms = totalRooms;
    bookings[index].startingDayOfStay = new Date(bookings[index].startingDayOfStay).toLocaleString(
      "en-us",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
    bookings[index].endingDayOfStay = new Date(bookings[index].endingDayOfStay).toLocaleString(
      "en-us",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
    finalData.push(bookings[index]);
    if (index == bookings.length - 1) {
      sendData();
    }
  });

  function sendData() {
    res.send(finalData);
  }
});

router.get("/guest", [auth, receptionMiddleware], async (req, res) => {
  const {roomIds} = req.query;
  let finalRoomsData = [];
  let rooms = [await Room.find().where("_id").in(roomIds).lean()];
  for (let room of rooms) {
    finalRoomsData.push(await retrieveMainPhoto(room));
  }

  return res.send(_.flattenDeep(finalRoomsData));
});

router.get("/todays", [auth, receptionMiddleware], async (req, res) => {
  var dateObj = new Date();
  let date = dateObj.getUTCDate();
  let month = dateObj.getUTCMonth() + 1;
  let year = dateObj.getUTCFullYear();

  date = date.toString();
  month = month.toString();

  if (date.length == 1) date = "0" + date;
  if (month.length == 1) month = "0" + month;

  newdate = year + "-" + month + "-" + date;
  const bookings = await Booking.find()
    .where("hotelId")
    .in(req.user.hotelId)
    .where("startingDayOfStay")
    .lte(newdate)
    .where("status")
    .eq("yettostay")
    .lean();
  if (!bookings[0]) return res.status(404).send("No bookings for today");

  let finalData = [];
  for (i = 0; i < bookings.length; i++) {
    let guest = await Guest.findById(bookings[i].guestId);
    if (!guest) guest = await OfflineGuest.findById(bookings[i].guestId);
    bookings[i]["endingDayOfStay"] = getCheckoutDate(bookings[i]["endingDayOfStay"]);
    bookings[i]["name"] = guest.name;
    bookings[i]["email"] = guest.email;
    bookings[i]["phoneNumber"] = guest?.phoneNumber || "919164253030";
    finalData.push(bookings[i]);
  }
  res.send(finalData);
});

router.get("/upcoming", [auth, receptionMiddleware], async (req, res) => {
  let {selectedDayRange} = req.query;
  let allTheDays;
  if (selectedDayRange) {
    selectedDayRange = JSON.parse(selectedDayRange);
    allTheDays = getDays(selectedDayRange);
  }

  var dateObj = new Date();
  let month = dateObj.getUTCMonth() + 1;
  let date = dateObj.getUTCDate();
  let year = dateObj.getUTCFullYear();
  month = month.toString();
  date = date.toString();

  if (month.length == 1) month = "0" + month;
  if (date.length == 1) date = "0" + date;

  newdate = year + "-" + month + "-" + date;
  let bookings;
  if (selectedDayRange?.from) {
    bookings = await Booking.find()
      .where("hotelId")
      .in(req.user.hotelId)
      .where("startingDayOfStay")
      .gte(allTheDays[0])
      .lte(allTheDays[allTheDays.length - 1])
      .lean();
  } else {
    bookings = await Booking.find()
      .where("hotelId")
      .in(req.user.hotelId)
      .where("startingDayOfStay")
      .gt(newdate)
      .lean();
  }

  if (!bookings[0]) return res.status(404).send("No bookings available");
  let finalData = [];

  for (i = 0; i < bookings.length; i++) {
    let guest = await Guest.findById(bookings[i].guestId);
    if (!guest) guest = await OfflineGuest.findById(bookings[i].guestId);
    bookings[i]["endingDayOfStay"] = getCheckoutDate(bookings[i]["endingDayOfStay"]);
    bookings[i]["name"] = guest.name;
    bookings[i]["email"] = guest.email;
    bookings[i]["phoneNumber"] = guest?.phoneNumber || "919164253030";
    finalData.push(bookings[i]);
  }
  res.send(finalData);
});

router.get("/staying", [auth, receptionMiddleware], async (req, res) => {
  bookings = await Booking.find()
    .where("hotelId")
    .in(req.user.hotelId)
    .where("status")
    .eq("checkedin")
    .lean();
  if (!bookings[0]) return res.status(404).send("No bookings available");

  let finalData = [];
  for (i = 0; i < bookings.length; i++) {
    let guest = await Guest.findById(bookings[i].guestId);
    if (!guest) guest = await OfflineGuest.findById(bookings[i].guestId);
    bookings[i]["endingDayOfStay"] = getCheckoutDate(bookings[i]["endingDayOfStay"]);
    bookings[i]["name"] = guest.name;
    bookings[i]["email"] = guest.email;
    bookings[i]["phoneNumber"] = guest?.phoneNumber || "919164253030";
    finalData.push(bookings[i]);
  }
  res.send(finalData);
});

router.get("/details/:id", [auth, receptionMiddleware], async (req, res) => {
  const booking = await Booking.findById(req.params.id).lean();
  let extraBed;
  for (let [key, value] of Object.entries(booking.roomDetails)) {
    const room = await Room.findById(key);

    _.assign(value, _.pick(room, ["roomType", "availableRoomNumbers"]));
    const hotel = await Hotel.findById(room.hotelId).select({
      extraBed: 1,
      noOfExtraBeds: 1,
      pricePerExtraBed: 1,
    });

    if (hotel.extraBed) {
      value["pricePerExtraBed"] = hotel.pricePerExtraBed;
      value["noOfExtraBeds"] = hotel.noOfExtraBeds;
      extraBed = hotel.extraBed;
    }
  }

  const roomBoys = await RoomBoy.find({
    currentHotelId: booking.hotelId,
  }).select({name: 1});

  let guest;
  guest = await Guest.findById(booking.guestId);
  if (!guest) guest = await OfflineGuest.findById(booking.guestId);

  _.assign(booking, _.pick(guest, ["name", "phoneNumber", "email"]));
  let roomFinalDetails = [];
  for (let [key, value] of Object.entries(booking.roomDetails)) {
    _.range(value.numberOfRoomsBooked).map((room, index) => {
      value["roomNumber"] = "Select Room Number";
      value["roomBoy"] = "Select Room Boy";
      value["selectedExtraBed"] = 0;
      value["roomId"] = key;
      roomFinalDetails.push(value);
    });
  }

  booking["roomFinalDetails"] = roomFinalDetails;
  booking["identityProof"] = "";
  booking["identityProofNumber"] = "";
  booking["address"] = "";
  booking["phoneNumber"] = booking["phoneNumber"] || "";
  booking["roomBoys"] = roomBoys;
  booking["extraBed"] = extraBed;
  booking["endingDayOfStay"] = getCheckoutDate(booking["endingDayOfStay"]);
  res.send(booking);
});

router.post(
  "/checkin",
  [auth, receptionMiddleware, validate(validateBooking)],
  async (req, res) => {
    createFolder(req.user.email);
    var dateObj = new Date();
    let month = dateObj.getUTCMonth() + 1;
    let date = dateObj.getUTCDate();
    let year = dateObj.getUTCFullYear();
    month = month.toString();
    date = date.toString();

    if (month.length == 1) month = "0" + month;
    if (date.length == 1) date = "0" + date;

    newdate = year + "-" + month + "-" + date;
    req.body.startingDayOfStay = req.body.startingDayOfStay.replace(/\//g, "-");

    req.body.identityProof = await convertBase64toImage(req.user.email, req.body.identityProof);
    for (let data of req.body.roomFinalDetails) {
      await Room.findByIdAndUpdate(data.roomId, {
        $pull: {availableRoomNumbers: {$in: [data.roomNumber]}},
      });
    }

    let checkinRoomDetails = [];
    req.body.roomFinalDetails.map(details =>
      checkinRoomDetails.push(
        _.pick(details, [
          "roomNumber",
          "selectedExtraBed",
          "adults",
          "children",
          "roomBoyId",
          "roomType",
        ])
      )
    );

    const booking = await Booking.findByIdAndUpdate(
      req.body._id,
      {
        $set: {
          status: "checkedin",
          roomFinalDetails: checkinRoomDetails,
          identityProof: req.body.identityProof,
          identityProofNumber: req.body.identityProofNumber,
          lateStartingDayOfStay: newdate !== req.body.startingDayOfStay ? newdate : null,
        },
      },
      {new: true}
    );

    guest = await Guest.findById(booking.guestId);
    if (!guest) guest = await OfflineGuest.findById(booking.guestId);

    guest["phoneNumber"] = req.body.phoneNumber;
    guest["address"] = req.body.address;
    guest.save().then(() => {
      if (guest.email) checkinMail(guest.email, booking);
      if (guest.phoneNumber) checkinMessage(booking, guest.phoneNumber);
    });

    res.send("done");
  }
);

router.get("/checkout/:id", [auth, receptionMiddleware], async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (booking.status !== "checkedin") return res.status(400).send("Something went wrong");

  let hotel = await Hotel.findById(booking.hotelId);
  let price = 0;
  let accomodationTotal = 0;
  let extraBedTotal = 0;
  let roomNumbers = [];
  let roomDetails = [];

  for (let data of booking.roomFinalDetails) {
    let object = {};
    roomNumbers.push(data.roomNumber);
    const roomBoy = await RoomBoy.findById(data?.roomBoyId);
    object["roomBoy"] = roomBoy?.name;
    object["roomType"] = data?.roomType;
    object["roomNumber"] = data?.roomNumber;
    object["guests"] = Number(data?.adults) + Number(data?.children);
    object["adults"] = Number(data?.adults);
    object["children"] = Number(data?.children);
    roomDetails.push(object);
    let room = await Room.find().where("roomNumbers").in(data.roomNumber);
    accomodationTotal += room[0].basePricePerNight;
    extraBedTotal += data.selectedExtraBed * hotel.pricePerExtraBed;
  }

  let restaurantBillAmount = 0;
  booking.restaurantBill.map(item => {
    restaurantBillAmount += item.itemPrice * item.itemQuantity;
  });

  price += restaurantBillAmount + accomodationTotal;
  let guest = await Guest.findById(booking.guestId).lean();
  if (!guest) guest = await OfflineGuest.findById(booking.guestId).lean();

  guest["price"] = price;
  guest["restaurantBillAmount"] = restaurantBillAmount;
  guest["accomodationTotal"] = accomodationTotal;
  guest["extraBedTotal"] = extraBedTotal;
  guest["roomNumbers"] = roomNumbers;
  guest["roomDetails"] = roomDetails;
  res.send(guest);
});

router.delete("/:id", [auth, receptionMiddleware], async (req, res) => {
  const data = await Booking.findById(req.params.id);
  if (data.status !== "yettostay") return res.status(400).send("Cancellation revoked!");

  const LocalDate = JSJoda.LocalDate;
  const booking = await Booking.findByIdAndDelete(req.params.id);
  const start_date = new LocalDate.parse(booking.startingDayOfStay);
  const end_date = new LocalDate.parse(booking.endingDayOfStay);

  const totalDays = days(
    new Date(booking.startingDayOfStay),
    JSJoda.ChronoUnit.DAYS.between(start_date, end_date) + 1
  );

  for (let [key, value] of Object.entries(booking.roomDetails)) {
    const room = await Room.findById(key);
    totalDays.map(day => {
      room.numberOfBookingsByDate[day] =
        room?.numberOfBookingsByDate[day] - value.numberOfRoomsBooked;
    });

    room.bookingFullDates = _.difference(room.bookingFullDates, totalDays);
    room.markModified("numberOfBookingsByDate", "bookingFullDates");
    await room.save();
  }

  var dateObj = new Date();
  let date = dateObj.getUTCDate();
  let month = dateObj.getUTCMonth() + 1;
  let year = dateObj.getUTCFullYear();

  date = date.toString();
  month = month.toString();

  if (date.length == 1) date = "0" + date;
  if (month.length == 1) month = "0" + month;

  newdate = year + "-" + month + "-" + date;
  const bookings = await Booking.find()
    .where("hotelId")
    .in(booking.hotelId)
    .where("startingDayOfStay")
    .eq(newdate)
    .where("status")
    .eq("yettostay")
    .lean();

  let finalData = [];

  for (i = 0; i < bookings.length; i++) {
    let guest = await Guest.findById(bookings[i].guestId);
    if (!guest) guest = await OfflineGuest.findById(bookings[i].guestId);
    bookings[i]["endingDayOfStay"] = getCheckoutDate(bookings[i]["endingDayOfStay"]);
    bookings[i]["name"] = guest.name;
    bookings[i]["email"] = guest.email;
    bookings[i]["phoneNumber"] = guest?.phoneNumber || "919164253030";
    finalData.push(bookings[i]);
  }
  res.send(finalData);
});

router.post("/checkout/:id", [auth, receptionMiddleware], async (req, res) => {
  const result = await Booking.findById(req.params.id);
  if (result.status !== "checkedin")
    return res.status(400).send("Either you already checked out or you have not checked in");

  req?.body?.roomNumbers.map(async roomNumber => {
    await Room.findOneAndUpdate(
      {
        roomNumbers: {$in: [roomNumber]},
        availableRoomNumbers: {$nin: [roomNumber]},
      },
      {$push: {availableRoomNumbers: roomNumber}}
    );
  });

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        status: "checkedout",
        additionalCharges: req.body.items,
      },
    },
    {new: true}
  );

  var dateObj = new Date();
  let month = dateObj.getUTCMonth() + 1;
  let date = dateObj.getUTCDate();
  let year = dateObj.getUTCFullYear();
  month = month.toString();
  date = date.toString();

  if (month.length == 1) month = "0" + month;
  if (date.length == 1) date = "0" + date;

  newdate = year + "-" + month + "-" + date;
  const LocalDate = JSJoda.LocalDate;

  function getNumberOfDays(start, end) {
    const start_date = new LocalDate.parse(start);
    const end_date = new LocalDate.parse(end);
    return JSJoda.ChronoUnit.DAYS.between(start_date, end_date);
  }

  var num = getNumberOfDays(booking.startingDayOfStay, booking.endingDayOfStay);
  let allTheDays = days(new Date(newdate), num + 1);

  if (allTheDays[0]) {
    for (let [key, value] of Object.entries(booking.roomDetails)) {
      const room = await Room.findById(key);
      allTheDays.map(day => {
        room.numberOfBookingsByDate[day] =
          room?.numberOfBookingsByDate[day] - value.numberOfRoomsBooked;
      });

      room.bookingFullDates = _.difference(room.bookingFullDates, allTheDays);
      room.markModified("numberOfBookingsByDate", "bookingFullDates");
      await room.save();
    }
    await Booking.findByIdAndUpdate(req.params.id, {
      $set: {earlyEndingDayOfStay: newdate},
    });
  }

  let guest = await Guest.findById(booking.guestId).lean();
  if (guest) {
    await Guest.findByIdAndUpdate(booking.guestId, {
      $pull: {bookedHotelDetails: {$in: [booking.hotelId]}},
    });
    await Guest.findByIdAndUpdate(booking.guestId, {
      $push: {previousBookedHotelDetails: booking.hotelId},
    });
  }

  if (!guest) {
    guest = await OfflineGuest.findById(booking.guestId).lean();
    await OfflineGuest.findByIdAndUpdate(booking.guestId, {
      $pull: {bookedHotelDetails: {$in: [booking.hotelId]}},
    });
    await OfflineGuest.findByIdAndUpdate(booking.guestId, {
      $push: {previousBookedHotelDetails: booking.hotelId},
    });
  }

  if (guest.email) await checkoutMail(guest.email, booking);
  if (guest.phoneNumber) await checkoutMessage(booking, guest.phoneNumber);
  res.send("done");
});

router.get("/completed", [auth, receptionMiddleware], async (req, res) => {
  let {selectedDayRange} = req.query;
  let allTheDays;
  if (selectedDayRange) {
    selectedDayRange = JSON.parse(selectedDayRange);
    allTheDays = getDays(selectedDayRange);
  }

  var dateObj = new Date();
  let month = dateObj.getUTCMonth() + 1;
  let date = dateObj.getUTCDate();
  let year = dateObj.getUTCFullYear();
  month = month.toString();
  date = date.toString();

  if (month.length == 1) month = "0" + month;
  if (date.length == 1) date = "0" + date;

  newdate = year + "-" + month + "-" + date;
  let bookings;
  if (selectedDayRange?.from) {
    bookings = await Booking.find()
      .where("hotelId")
      .in(req.user.hotelId)
      .where("endingDayOfStay")
      .gte(allTheDays[0])
      .lte(allTheDays[allTheDays.length - 1])
      .where("status")
      .eq("checkedout")
      .lean();
  } else {
    bookings = await Booking.find()
      .where("hotelId")
      .in(req.user.hotelId)
      .where("status")
      .eq("checkedout")
      .lean();
  }

  if (!bookings[0]) return res.status(404).send("No bookings available");
  let finalData = [];
  for (i = 0; i < bookings.length; i++) {
    let guest = await Guest.findById(bookings[i].guestId);
    if (!guest) guest = await OfflineGuest.findById(bookings[i].guestId);
    bookings[i]["name"] = guest.name;
    bookings[i]["email"] = guest.email;
    bookings[i]["phoneNumber"] = guest?.phoneNumber || "None";
    finalData.push(bookings[i]);
  }
  res.send(finalData);
});

router.get("/downloadInvoice/:id", [auth, receptionMiddleware], async (req, res) => {
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
    let object = {};
    const room = await Room.find().where("roomNumbers").in(data.roomNumber);
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

router.post("/", [auth, receptionMiddleware], async (req, res) => {
  const {roomDetails, selectedDayRange, hotelId, offlineGuestId} = req.body;
  if (!mongoose.Types.ObjectId.isValid(hotelId)) return res.status(404).send("Invalid hotel Id");

  for (room of roomDetails) {
    if (!mongoose.Types.ObjectId.isValid(room.roomId))
      return res.status(404).send("Invalid room Id");
  }

  const allTheDays = getDays(selectedDayRange);
  const roomsDetails = {};

  for (room of roomDetails) {
    let roomDB = await Room.findById(room.roomId);
    roomsDetails[room.roomId] = {
      numberOfRoomsBooked: room.noOfRooms,
      pricePerRoom: roomDB.basePricePerNight,
      beds: roomDB.numberOfBeds,
      guests: roomDB.numberOfGuestsInaRoom,
    };

    for (date of allTheDays) {
      if (!roomDB?.numberOfBookingsByDate) roomDB.numberOfBookingsByDate = {};
      if (date in roomDB?.numberOfBookingsByDate) {
        roomDB.numberOfBookingsByDate[date] += room.noOfRooms;
        if (roomDB?.numberOfBookingsByDate[date] == roomDB?.numberOfRoomsOfThisType)
          roomDB?.bookingFullDates.push(date);
        if (roomDB?.numberOfBookingsByDate[date] > roomDB?.numberOfRoomsOfThisType)
          return res.status(400).send("Someone already booked, please refresh your page.");
      } else {
        roomDB.numberOfBookingsByDate[date] = room.noOfRooms;
        if (roomDB?.numberOfBookingsByDate[date] == roomDB?.numberOfRoomsOfThisType)
          roomDB?.bookingFullDates.push(date);
        if (roomDB?.numberOfBookingsByDate[date] > roomDB?.numberOfRoomsOfThisType)
          return res.status(400).send("Someone already booked, please refresh your page.");
      }
    }
    roomDB.markModified("numberOfBookingsByDate", "bookingFullDates");
    await roomDB.save();
  }

  const bookingsCount = await Booking.find().count();
  const roomData = {};
  roomData["guestId"] = offlineGuestId;
  roomData["hotelId"] = hotelId;
  roomData["bookedOn"] = new Date().toLocaleString("en-us", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  roomData["startingDayOfStay"] = allTheDays[0];
  roomData["endingDayOfStay"] = allTheDays[allTheDays.length - 1];
  roomData["roomDetails"] = roomsDetails;
  roomData["bookingMode"] = "offline";
  roomData["hotelBookingId"] = "" + Math.floor(Math.random() * (99 - 10 + 1) + 10) + bookingsCount;
  roomData["linkReviewId"] = "" + Math.floor(Math.random() * (999 - 100 + 1) + 100) + Date.now();

  const booking = new Booking(roomData);
  await booking.save();

  const offlineGuestData = await OfflineGuest.findByIdAndUpdate(offlineGuestId, {
    $push: {bookedHotelDetails: booking.hotelId},
  });

  if (offlineGuestData.email)
    await bookedMail(offlineGuestData.email, booking, offlineGuestData.name);
  if (offlineGuestData.phoneNumber)
    await bookedMessage(booking.hotelBookingId, offlineGuestData.phoneNumber);
  res.send("Successfully booked");
});

module.exports = router;
