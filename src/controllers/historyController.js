const History = require("../models/History");

// const createHistory = async (req, res) => {
//     try {
//         const { action, bookId, userId, previousStatus, newStatus } = req.body;

//         if (!action || !bookId || !userId) {
//             return res.status(400).json({ message: "Missing required fields" });
//         }

//         const history = await History.create({
//             action,
//             book: bookId,
//             user: userId,
//             previousStatus,
//             newStatus,
//         });

//         res.status(201).json(history);
//     } catch (error) {
//         res.status(500).json({ message: "Error creating history", error });
//     }
// };

const getAllHistory = async (req, res) => {
    try {
        const history = await History.find()
            .populate("book", "title author")
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: "Error fetching history", error });
    }
};

const getUserHistory = async (req, res) => {
    try {
        const userId = req.userId;

        const history = await History.find({ user: userId })
            .populate("book", "title author")
            .sort({ createdAt: -1 });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user history", error });
    }
};

// const getBookHistory = async (req, res) => {
//     try {
//         const bookId = req.params.bookId;

//         const history = await History.find({ book: bookId })
//             .populate("user", "name email")
//             .sort({ createdAt: -1 });

//         res.json(history);
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching book history", error });
//     }
// };

module.exports = {
    getAllHistory,
    getUserHistory,
};
