const imageToBase64 = require("image-to-base64");

module.exports = function (pathToImage) {
  return imageToBase64(pathToImage)
    .then(response => {
      return {response, error: ""};
    })
    .catch(error => {
      return {error, response: ""};
    });
};
