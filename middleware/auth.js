const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  if (!process.env.requiresAuth) return next();

  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, process.env.JWT_AUTH_PRIVATE_KEY);
    req.user = decoded;
    global.__baseurl=req.headers.host
    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};
