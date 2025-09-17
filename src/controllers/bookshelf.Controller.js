const Bookshelf = require("../models/Bookshelf");
const History = require("../models/History");
const Notes = require("../models/Note");
const mongoose = require("mongoose");


const addBook = async (req, res) => {
    try {
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

        res.status(201).json({ message: "Book added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error adding book", error });
        console.log(error);

    }
};

const deleteBook = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const book = await Bookshelf.findByIdAndUpdate(
            { _id: id, user: req.userId, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );

        if (!book) return res.status(404).json({ message: "Book not found" });

        // 🔹 Log delete
        await History.create({
            action: "DELETE",
            book: id,
            user: userId,
        });

        res.status(201).json({ message: "Book deleted" });
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
        const { newStatus } = req.body;
        const { id } = req.params;


        const book = await Bookshelf.findById(id);
        if (!book) return res.status(404).json({ message: "Book not found" });

        const previousStatus = book.status;
        book.status = newStatus;
        await book.save();

        // 🔹 Log status update
        await History.create({
            action: "UPDATE_STATUS",
            book: id,
            user: userId,
            previousStatus,
            newStatus,
        });

        res.status(201).json({ message: "Book Status updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating status", error });
    }
};

const editBook = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { ...updatedFields } = req.body;

        const book = await Bookshelf.findById(id);
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
            book: id,
            user: userId,
        });

        res.status(201).json({ message: "Book updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error editing book", error });
    }
};
const getBookById = async (req, res) => {
    try {
        const Book = await Bookshelf.findOne({ _id: req.params.id, user: req.userId, isDeleted: false }).populate("genre", "name").exec();;
        if (!Book) return res.status(404).json({ message: "Genre not found" });

        res.status(201).json({ Book });
    } catch (error) {
        res.status(500).json({ message: error.message });
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

        res.status(201).json({ books });
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

        res.status(201).json({ books });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getDashboardCounts = async (req, res) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(req.userId);

        const aggData = await Bookshelf.aggregate([
            { $match: { user: userObjectId, isDeleted: false } },
            {
                $facet: {

                    totals: [
                        {
                            $match: { bookList: "BookShelf" }   // ✅ filter first
                        },
                        {
                            $group: {
                                _id: null,
                                totalPrice: { $sum: "$price" },
                                count: { $sum: 1 }
                            }
                        }
                    ],

                    byGenre: [

                        {
                            $match: { user: userObjectId, isDeleted: false } // filter by user
                        },
                        {
                            $group: {
                                _id: "$genre",        // group by genre ObjectId
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $lookup: {
                                from: "genres",       // collection name in MongoDB (usually lowercase plural)
                                localField: "_id",    // _id from group = genre ObjectId
                                foreignField: "_id",  // match with Genre _id
                                as: "genreDetails"
                            }
                        },
                        { $unwind: "$genreDetails" },
                        {
                            $project: {
                                _id: 0,
                                genreId: "$_id",
                                name: "$genreDetails.name",
                                color: "$genreDetails.color",
                                count: 1
                            }
                        },
                        {
                            $sort: { count: -1 }

                        },
                        { $sort: { count: -1 } }

                    ],

                    byStatus: [
                        {
                            $group: {
                                _id: { $ifNull: ["$status", "Unknown"] },
                                count: { $sum: 1 }
                            }
                        }
                    ],

                    byLanguage: [
                        {
                            $group: {
                                _id: "$language",
                                count: { $sum: 1 }
                            }
                        }
                    ],

                    topBook: [
                        { $sort: { rating: -1 } },
                        { $limit: 1 },
                        { $project: { title: 1, rating: 1 } }
                    ],

                    lastReaded: [
                        { $match: { status: 3 } },
                        { $sort: { updatedAt: -1 } },
                        { $limit: 1 },
                        { $project: { title: 1, updatedAt: 1 } }
                    ]
                }
            }
        ]);

        const result = aggData[0] || {};
        const totals = result.totals[0] || { totalPrice: 0, count: 0 };

        const [wishlistCount, notesCount, readedCount, notreadedCount] = await Promise.all([
            Bookshelf.countDocuments({ user: userObjectId, isDeleted: false, bookList: "Wishlist" }),
            Notes.countDocuments({ user: userObjectId }),
            Bookshelf.countDocuments({ user: userObjectId, isDeleted: false, status: { $in: [2, 3] } }),
            Bookshelf.countDocuments({ user: userObjectId, isDeleted: false, status: 1 })
        ]);

        res.status(201).json({
            allBooks: totals.count,
            wishlist: wishlistCount,
            notes: notesCount,
            readed: readedCount,
            notreaded: notreadedCount,
            totalValue: totals.totalPrice,
            topRated: result.topBook[0]?.title || null,
            lastReaded: result.lastReaded[0]?.title || null,

            booksByGenre: result.byGenre,
            booksByStatus: result.byStatus,
            booksByLanguage: result.byLanguage
        });
    } catch (error) {
        console.error("Error in getDashboardCounts:", error);
        res.status(500).json({ message: "Error fetching dashboard counts", error });
    }
};



module.exports = {
    addBook,
    deleteBook,
    updateBookStatus,
    editBook,
    getBooks,
    getBookById,
    getWishlist,
    getDashboardCounts
};
