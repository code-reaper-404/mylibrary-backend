const Note = require("../models/Note");

const addNote = async (req, res) => {
    try {
        const note = await Note.create({ ...req.body, user: req.userId ,isDeleted:false});
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.userId, isDeleted: false });

        res.status(201).json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getNoteById = async (req, res) => {
    try {
        const { noteId } = req.params;
        const note = await Note.findOne({ _id: noteId, user: req.userId, isDeleted: { $ne: true } });

        if (!note) return res.status(404).json({ message: "Note not found" });

        res.status(200).json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateNote = async (req, res) => {
    try {
        const { noteId } = req.params;

        const note = await Note.findOneAndUpdate(
            { _id: noteId, user: req.userId, isDeleted: { $ne: true } },
            req.body,
            { new: true, runValidators: true }
        );

        if (!note) return res.status(404).json({ message: "Note not found" });

        res.status(200).json({ message: "Note updated successfully", note });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const note = await Note.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
        // console.log(note);

        if (!note) return res.status(404).json({ message: "note not found" });

        res.status(201).json({ message: "note deleted", note });
    } catch (error) {
        res.status(500).json({ message: "Error deleting Note", error });
        console.log(error);
    }
};
module.exports = { addNote, getNotes, deleteNote, getNoteById, updateNote };
