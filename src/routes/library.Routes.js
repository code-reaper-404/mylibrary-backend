const express = require("express");
const { addBook, getBooks,updateBookStatus,deleteBook,getWishlist,editBook ,getDashboardCounts} = require("../controllers/bookshelfController");
const { addGenre, getGenre } = require("../controllers/genreController");
const { addNote, getNotes,deleteNote } = require("../controllers/notesController");
const { protect } = require("../middleware/auth.Middleware");

const router = express.Router();


router.post("/add-book",protect, addBook);
router.get("/get-book",protect, getBooks);
router.delete("/delete-book",protect, deleteBook);
router.patch("/book-status",protect, updateBookStatus);
router.put("/edit-book",protect, editBook);
router.get("/get-wishlist", protect, getWishlist);
router.get("/get-dashboard-count", protect, getDashboardCounts);

router.post("/add-genre", protect, addGenre);
router.get("/get-genre", protect, getGenre);

router.post("/add-note", protect, addNote);
router.get("/get-note", protect, getNotes);
router.get("/delete-note", protect, deleteNote);

module.exports = router;
