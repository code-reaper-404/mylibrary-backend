const express = require("express");
const { addBook, getBooks, updateBookStatus, deleteBook, getWishlist, editBook, getDashboardCounts, getBookById } = require("../controllers/bookshelf.Controller");
const { addGenre, getGenre, updateGenre, deleteGenre, getGenreById } = require("../controllers/genre.Controller");
const { addNote, getNotes, deleteNote } = require("../controllers/notes.Controller");
const { protect } = require("../middleware/auth.Middleware");

const router = express.Router();


router.post("/add-book", protect, addBook);
router.get("/get-book", protect, getBooks);
router.get("/get-book/:id", protect, getBookById);
router.put("/edit-book/:id", protect, editBook);
router.delete("/delete-book/:id", protect, deleteBook);

router.patch("/book-status/:id", protect, updateBookStatus);
router.get("/get-wishlist", protect, getWishlist);
router.get("/get-dashboard-count", protect, getDashboardCounts);

router.post("/add-genre", protect, addGenre);
router.get("/get-genre", protect, getGenre);
router.get("/get-genre/:id", protect, getGenreById);
router.put("/edit-genre/:id", protect, updateGenre);
router.delete("/delete-genre/:id", protect, deleteGenre);

router.post("/add-note", protect, addNote);
router.get("/get-note", protect, getNotes);
router.get("/delete-note/:id", protect, deleteNote);

module.exports = router;
