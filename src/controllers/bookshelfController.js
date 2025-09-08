const Bookshelf = require("../models/Bookshelf");
const History = require("../models/History");
const Notes = require("../models/Note");
const mongoose = require("mongoose");


const addBook = async (req, res) => {
    try {
        console.log(req.body);

        const { title, author, genre, pages, price, language, year, description, source, status, bookList, rating, imageURL } = req.body;

        const userId = req.userId;
        const book = await Bookshelf.create({
            title, author, genre, pages, price, language, year, description, source, status, rating, bookList, imageURL, isDeleted: false, user: userId,
        });

        // 🔹 Create history log
        await History.create({
            action: "ADD",
            book: book._id,
            user: userId,
        });

        res.status(201).json({
            message: "Book added successfully",
            status: 201,
        });
    } catch (error) {
        res.status(500).json({ message: "Error adding book", error });
        console.log(error);

    }
};

const deleteBook = async (req, res) => {
    try {
        const userId = req.userId;
        const { bookId } = req.body; // from auth middleware in real apps

        const book = await Bookshelf.findByIdAndUpdate(
            bookId,
            { isDeleted: true },
            { new: true }
        );

        if (!book) return res.status(404).json({ message: "Book not found" });

        // 🔹 Log delete
        await History.create({
            action: "DELETE",
            book: bookId,
            user: userId,
        });

        res.json({ message: "Book deleted", status: 201, book });
    } catch (error) {
        res.status(500).json({ message: "Error deleting book", error });
        console.log(
            error
        );

    }
};

const updateBookStatus = async (req, res) => {
    try {
        const userId = req.userId;
        const { newStatus, bookId } = req.body;

        const book = await Bookshelf.findById(bookId);
        if (!book) return res.status(404).json({ message: "Book not found" });

        const previousStatus = book.status;
        book.status = newStatus;
        await book.save();

        // 🔹 Log status update
        await History.create({
            action: "UPDATE_STATUS",
            book: bookId,
            user: userId,
            previousStatus,
            newStatus,
        });

        res.status(201).json({
            message: "Book Status updated successfully",
            status: 201,
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating status", error });
    }
};

const editBook = async (req, res) => {
    try {
        const userId = req.userId;

        const { bookId, ...updatedFields } = req.body;

        const book = await Bookshelf.findById(bookId);
        if (!book) return res.status(404).json({ message: "Book not found" });

        // Save old values for history (optional: track which fields changed)
        const oldData = book.toObject();

        // Update with new fields
        Object.keys(updatedFields).forEach((key) => {
            book[key] = updatedFields[key];
        });

        await book.save();

        // 🔹 Log edit action
        await History.create({
            action: "EDIT",
            book: bookId,
            user: userId,
        });

        res.status(201).json({
            message: "Book updated successfully",
            status: 201,
        });
    } catch (error) {
        res.status(500).json({ message: "Error editing book", error });
    }
};

const getBooks = async (req, res) => {
    try {
        const userId = req.userId;

        const books = await Bookshelf.find({
            user: userId,
            isDeleted: false,
            bookList: "BookShelf",
        })
            .populate("genre", "name")
            .exec();

        res.json(books);
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ message: "Error fetching books", error });
    }
};


const getWishlist = async (req, res) => {
    try {
        const userId = req.userId;

        const books = await Bookshelf.find({
            user: userId,
            isDeleted: false,
            bookList: "Wishlist",
        })
            .populate("genre", "name")
            .exec();

        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getDashboardCounts = async (req, res) => {
    try {
        const userId = req.userId;
        const totalPriceAgg = await Bookshelf.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId), isDeleted: false } },
            { $group: { _id: null, totalPrice: { $sum: "$price" } } }
        ]);

        const totalPrice = totalPriceAgg[0]?.totalPrice || 0;

        const topBookData = await Bookshelf.findOne({ user: userId, isDeleted: false })
            .sort({ rating: -1 })
            .limit(1);
        const lastStatusRead = await Bookshelf.findOne({ user: userId, isDeleted: false, status: 3 })
            .sort({ updatedAt: -1 })   // latest change (timestamp from schema)
            .limit(1);
        let lastStatusReaded = null;
        if (lastStatusRead != null) {
            lastStatusReaded = lastStatusRead.title;
        }
        let topBook = null;
        if (topBookData != null) {
            topBook = topBookData.title;
        }

        const [booksCount, wishlistCount, notesCount, readedCount, notreadedCount] = await Promise.all([
            Bookshelf.countDocuments({ user: userId, isDeleted: false }),
            Bookshelf.countDocuments({ user: userId, isDeleted: false, bookList: "Wishlist" }),
            Notes.countDocuments({ user: userId }),
            Bookshelf.countDocuments({ user: userId, isDeleted: false, "status": 3 }),
            Bookshelf.countDocuments({ user: userId, isDeleted: false, "status": 1 }),
        ]);

        res.json({
            allBooks: booksCount,
            wishlist: wishlistCount,
            notes: notesCount,
            readed: readedCount,
            notreaded: notreadedCount,
            totalValue: totalPrice,
            topRated: topBook,
            lastReaded: lastStatusReaded,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching dashboard counts", error });
    }
};

module.exports = {
    addBook,
    deleteBook,
    updateBookStatus,
    editBook,
    getBooks,
    getWishlist,
    getDashboardCounts
};
