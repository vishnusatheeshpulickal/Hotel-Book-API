const rimraf = require("rimraf");

module.exports = function (dir, callback) {
  rimraf(dir, function (err) {
    callback(err);
  });
};
