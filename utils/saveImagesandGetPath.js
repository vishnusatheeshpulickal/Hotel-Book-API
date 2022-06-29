const convertBase64toImage = require("./convertBase64toImage");
const {Room} = require("../models/room");

module.exports = async function (req, method) {
  if (method === "put" && req.body?.isMainPhotoChanged) {
    req.body.mainPhoto = await convertBase64toImage(req.user.email, req.body.mainPhoto);
  }

  if (method === "put" && !req.body?.isMainPhotoChanged) {
    let result = await Room.findById(req.params.id).select({
      mainPhoto: 1,
    });
    req.body.mainPhoto = result.mainPhoto;
  }

  if (!method) {
    req.body.mainPhoto = await convertBase64toImage(req.user.email, req.body.mainPhoto);
  }

  let photos = [];
  if (req.body.photos?.length > 0)
    for (let image of req.body.photos)
      photos.push(await convertBase64toImage(req.user.email, image));
  req.body.photos = photos;
};
