const express = require("express");
const { signup, login, logout, checkAuth } = require("../controllers/auth.Controller");
const { protect } = require("../middleware/auth.Middleware");
const { getProfile, updateProfile, resetPassword } = require("../controllers/user.Controller");
const router = express.Router();

//auth-routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check-auth", (req, res, next) => { req.fetchUser = true; next(); }, protect, checkAuth);

//user-routes
router.get("/get-user", protect, getProfile);
router.put("/update-user", protect, updateProfile);
router.put("/reset-password", protect, resetPassword);

module.exports = router;
