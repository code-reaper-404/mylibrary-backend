const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate Token
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,        // must be true for SameSite=Non
    sameSite: "None",    // allows cross-site cookie usage
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });
};

// Signup
const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });
    generateToken(res, user._id);

    res.status(201).json({ message: "User registered", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);
      res.status(200).json({ status: 200, message: "Login successful", user });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout
const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};
// controllers/authController.js
const checkAuth = (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ isAuthenticated: false });
    }

    // If full user was fetched by middleware
    if (req.user) {
      return res.status(200).json({ isAuthenticated: true, user: req.user });
    }

    // If only userId is available
    res.json({ isAuthenticated: true, userId: req.userId });
  } catch (error) {
    res.status(500).json({ message: "Error checking auth", error });
  }
};

module.exports = { signup, login, logout, checkAuth };
