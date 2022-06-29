const Yup = require("yup");

module.exports = function () {
  Yup.objectId = require("joi-objectid")(Yup);
};
