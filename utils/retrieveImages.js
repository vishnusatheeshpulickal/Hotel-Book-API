const convertImageToBase64 = require("./convertImageToBase64");
const path = require("path");

async function retrieveMainPhoto(hotel) {
  for (item of hotel) {
    const imageType = path.extname(item?.mainPhoto).slice(1);

    const {error, response} = await convertImageToBase64(item?.mainPhoto);
    if (error) console.log("something went wrong");
    if (response) item["mainPhoto"] = `data:image/${imageType};base64,` + response;
  }
  return hotel;
}

async function retrieveMainPhotobyPath(imagePath) {
  const imageType = path.extname(imagePath).slice(1);

  const {error, response} = await convertImageToBase64(imagePath);
  if (error) console.log("something went wrong");
  if (response) data = `data:image/${imageType};base64,` + response;
  return data;
}

async function retrieveOtherPhotos(hotel) {
  let base64Photos = [];
  for (photo of hotel[0].photos) {
    const imageType = path.extname(photo).slice(1);
    const {error, response} = await convertImageToBase64(photo);
    if (error) console.log("something went wrong", error);
    if (response) base64Photos.push(`data:image/${imageType};base64,` + response);
  }

  hotel[0].photos = base64Photos;
  return hotel[0];
}

exports.retrieveMainPhoto = retrieveMainPhoto;
exports.retrieveOtherPhotos = retrieveOtherPhotos;
exports.retrieveMainPhotobyPath = retrieveMainPhotobyPath;
