const Note = require("../models/Note");

const addNote = async (req, res) => {
    try {
        const note = await Note.create({ ...req.body, user: req.userId });
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.userId });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.userId;

        const note = await Note.findByIdAndUpdate(
            noteId,
            { isDeleted: true },
            { new: true }
        );

        if (!note) return res.status(404).json({ message: "note not found" });

        // 🔹 Log delete
        await History.create({
            action: "DELETE",
            note: noteId,
            user: userId,
        });

        res.json({ message: "note deleted", note });
    } catch (error) {
        res.status(500).json({ message: "Error deleting Note", error });
    }
};
module.exports = { addNote, getNotes, deleteNote };
