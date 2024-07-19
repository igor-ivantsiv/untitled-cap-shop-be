const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  try {
    if (req.headers.authorization.split(" ")[0] !== "Bearer") {
      throw new Error("Token headers do not match expected headers");
    }
    const token = req.headers.authorization.split(" ")[1];
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);
    req.tokenPayload = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: "invalid or missing token" });
  }
};

module.exports = { 
    isAuthenticated, 
}
