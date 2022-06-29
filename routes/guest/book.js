const express = require("express");
const router = express.Router();
const _ = require("lodash");
const mongoose = require("mongoose");
const guestMiddleware = require("../../middleware/guest");
const auth = require("../../middleware/auth");
const getDays = require("../../utils/getDays");
const validateObjectId = require("../../middleware/validateObjectId");
const days = require("days-in-a-row");
const JSJoda = require("js-joda");
const bookedMail = require("../../services/bookedMail");
const {retrieveMainPhoto, retrieveOtherPhotos} = require("../../utils/retrieveImages");
const {Booking} = require("../../models/booking");
const {Guest} = require("../../models/guest");
const {Hotel} = require("../../models/hotel");
const {Room} = require("../../models/room");

router.get("/", async (req, res) => {
  let {placeForSearch, selectedDayRange, hotelId} = req.query;
  let allTheDays;
  selectedDayRange = JSON.parse(selectedDayRange);

  if (selectedDayRange.from) {
    allTheDays = getDays(selectedDayRange);
  }

  let hotel = [await Hotel.findOne({city: placeForSearch})];
  if (!hotel[0]) hotel = [await Hotel.findById(hotelId)];
  if (!hotel[0]) return res.status(404).send("hotel with given id not found");

  hotel = await retrieveMainPhoto(hotel);
  hotel = await retrieveOtherPhotos(hotel);
  let data = {hotels: hotel, numberOfDays: allTheDays?.length};
  res.send(data);
});

router.get("/:id", [validateObjectId], async (req, res) => {
  let hotel = [await Hotel.findById(req.params.id)];
  if (!hotel[0]) return res.status(404).send("hotel with given id not found");
  hotel = await retrieveMainPhoto(hotel);
  hotel = await retrieveOtherPhotos(hotel);
  res.send(hotel);
});

router.post("/", [auth, guestMiddleware], async (req, res) => {
  const {roomDetails, selectedDayRange, hotelId} = req.body;
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

  const bookingsCount = await Booking.find().countDocuments();
  const roomData = {};
  roomData["guestId"] = req.user._id;
  roomData["hotelId"] = hotelId;
  roomData["bookedOn"] = new Date().toLocaleString("en-us", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  roomData["startingDayOfStay"] = allTheDays[0];
  roomData["endingDayOfStay"] = allTheDays[allTheDays.length - 1];
  roomData["roomDetails"] = roomsDetails;
  roomData["bookingMode"] = "online";
  roomData["hotelBookingId"] = "" + Math.floor(Math.random() * (99 - 10 + 1) + 10) + bookingsCount;
  roomData["linkReviewId"] = "" + Math.floor(Math.random() * (999 - 100 + 1) + 100) + Date.now();

  const newBooking = new Booking(roomData);
  await newBooking.save();

  await Guest.findByIdAndUpdate(req.user._id, {
    $push: {bookedHotelDetails: newBooking.hotelId},
  });
  await bookedMail(req.user.email, newBooking, req.user.name);
  res.send("Successfully booked");
});

router.delete("/:id", [auth, guestMiddleware], async (req, res) => {
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

  res.send("Successfully cancelled booking");
});

module.exports = router;
