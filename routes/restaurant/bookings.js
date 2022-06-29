const express = require("express");
const router = express.Router();
const _ = require("lodash");
const restaurantMiddleware = require("../../middleware/restaurant");
const auth = require("../../middleware/auth");
const {OfflineGuest} = require("../../models/offlineGuest");
const {Restaurant} = require("../../models/restaurant");
const {Booking} = require("../../models/booking");
const {Guest} = require("../../models/guest");

router.get("/staying", [auth, restaurantMiddleware], async (req, res) => {
  bookings = await Booking.find()
    .where("hotelId")
    .in(req.user.hotelId)
    .where("status")
    .eq("checkedin")
    .lean();
  if (!bookings[0]) return res.status(404).send("No bookings available");
      
  let finalData = [];
  for (i = 0; i < bookings.length; i++) {
    let roomNumbers = [];
    bookings[i].roomFinalDetails.map(details => roomNumbers.push(details["roomNumber"]));
    let guest = await Guest.findById(bookings[i].guestId);
    if (!guest) guest = await OfflineGuest.findById(bookings[i].guestId);
    bookings[i]["name"] = guest.name;
    bookings[i]["email"] = guest.email;
    bookings[i]["phoneNumber"] = guest?.phoneNumber || "919164253030";
    bookings[i]["roomNumbers"] = roomNumbers.join(",");
    finalData.push(bookings[i]);
  }
  res.send(finalData);
});

router.get("/fooditems", [auth, restaurantMiddleware], async (req, res) => {
  const foodItems = await Restaurant.findById(req.user._id).select({items: 1});
  if (!foodItems) return res.send(404).send("No food items found");
  res.send(foodItems);
});

router.post("/fooditems", [auth, restaurantMiddleware], async (req, res) => {
  await Restaurant.findByIdAndUpdate(req.user._id, {
    $set: {items: req.body.items},
  });
  res.send("done");
});

router.post("/addtobill", [auth, restaurantMiddleware], async (req, res) => {
  const billedItems = _.filter(req.body.items, obj => _.has(obj, "itemQuantity"));
  billedItems.map(item => {
    item.itemPrice = Number(item.itemPrice);
    item.itemQuantity = Number(item.itemQuantity);
  });

  const booking = await Booking.findById(req.body.bookingId).select({restaurantBill: 1});
  let restaurantBillCopy;
  if (booking?.restaurantBill) {
    restaurantBillCopy = [...booking.restaurantBill];
  }

  let finalRestaurantBill;
  if (!restaurantBillCopy) {
    booking.restaurantBill = billedItems;
    await booking.save();
  } else {
    restaurantBillCopy.map(item => {
      billedItems.map(bitem => {
        if (bitem.itemName == item?.itemName) {
          item.itemQuantity = Number(item.itemQuantity) + Number(bitem.itemQuantity);
        }
      });
    });
    finalRestaurantBill = [...restaurantBillCopy, ...billedItems];
    finalRestaurantBill = _.uniqBy(finalRestaurantBill, "itemName");

    booking.restaurantBill = finalRestaurantBill;
    booking.markModified("restaurantBill");
    await booking.save();
  }
  
  res.send("done");
});

module.exports = router;
