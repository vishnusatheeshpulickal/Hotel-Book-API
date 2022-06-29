const express = require("express");
const router = express.Router();
const _ = require("lodash");
const getDays = require("../../utils/getDays");
const {retrieveMainPhoto, retrieveOtherPhotos} = require("../../utils/retrieveImages");
const {Hotel} = require("../../models/hotel");
const {Room} = require("../../models/room");

router.get("/", async (req, res) => {
  let {roomIds, selectedDayRange, hotelId} = req.query;
  let hotel = await Hotel.findById(hotelId).select({
    extraBed: 1,
    noOfExtraBeds: 1,
    pricePerExtraBed: 1,
  });
  let rooms = [await Room.find().where("_id").in(roomIds).where("isVisible").eq(true).lean()];
  let finalRoomsData = [];
  let allTheDays;
  selectedDayRange = JSON.parse(selectedDayRange);
  if (selectedDayRange.from) {
    allTheDays = getDays(selectedDayRange);
  } else {
    for (let room of rooms) {
      finalRoomsData.push(await retrieveMainPhoto(room));
    }
    return res.send(_.flattenDeep(finalRoomsData));
  }
  rooms = _.flattenDeep(rooms);

  for (let room of rooms) {
    if (room.numberOfBookingsByDate) {
      let days = 0;
      for (let day of allTheDays) {
        if (day in room.numberOfBookingsByDate) {
          if (room.numberOfBookingsByDate[day] > days) days = room.numberOfBookingsByDate[day];
        }
      }
      room.numberOfRoomsOfThisType = room.numberOfRoomsOfThisType - days;
    }
    finalRoomsData.push(await retrieveMainPhoto([room]));
  }

  finalRoomsData = _.flattenDeep(finalRoomsData);
  for (let room of finalRoomsData) {
    if (hotel.extraBed) {
      room["noOfExtraBeds"] = hotel.noOfExtraBeds;
      room["extraBed"] = hotel.extraBed;
      room["pricePerExtraBed"] = hotel.pricePerExtraBed;
    }
  }

  for (let room of finalRoomsData) {
    _.remove(finalRoomsData, room => room.numberOfRoomsOfThisType == 0);
  }

  res.send(_.flattenDeep(finalRoomsData));
});

router.get("/:id", async (req, res) => {
  let room = [
    await Room.findById(req.params.id).select({
      photos: 1,
      facilities: 1,
      mainPhoto: 1,
    }),
  ];
  if (!room[0]) return res.status(404).send("room with given id not found");
  room = await retrieveMainPhoto(room);
  room = await retrieveOtherPhotos(room);
  res.send(room);
});

module.exports = router;
