const express = require("express");
const {
  getAllHistory,
  getUserHistory,
} = require("../controllers/historyController");

const router = express.Router();
const { protect } = require("../middleware/auth.Middleware");

router.get("/",protect, getAllHistory);
router.get("/user/",protect, getUserHistory);
// router.get("/book/:bookId", getBookHistory);

module.exports = router;