const express = require("express");
const { signup, login, logout, checkAuth } = require("../controllers/auth.Controller");
const { protect } = require("../middleware/auth.Middleware");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check-auth", (req, res, next) => { req.fetchUser = true; next(); }, protect, checkAuth)

module.exports = router;
