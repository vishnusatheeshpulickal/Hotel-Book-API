module.exports = function (err, req, res, next) {
  console.log("err", err);
  res.status(500).send("Something failed.");
};
