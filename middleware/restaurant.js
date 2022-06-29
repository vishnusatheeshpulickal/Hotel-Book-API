module.exports = function (req, res, next) {
    if (!req.user.isRestaurant) return res.status(403).send("Access denied");
    next();
  };
  