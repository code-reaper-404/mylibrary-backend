const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Always attach userId
    req.userId = decoded.id;

    // Optionally fetch full user (skip if not needed for performance)
    if (req.fetchUser) {
      req.user = await User.findById(decoded.id).select("-password");
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = {protect};
