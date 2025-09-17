const Genre = require("../models/Genre");
const Bookshelf = require("../models/Bookshelf");

const addGenre = async (req, res) => {
  try {
    const genre = await Genre.create({ ...req.body, user: req.userId, isDeleted: false });
    res.status(201).json({
      message: "Genre Created successfully",
      data: genre
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGenre = async (req, res) => {
  try {
    const genres = await Genre.find({ user: req.userId, isDeleted: false });

    const genreWithCounts = await Promise.all(
      genres.map(async (genre) => {
        const count = await Bookshelf.countDocuments({ user: req.userId, genre: genre._id, isDeleted: false });
        return {
          ...genre.toObject(),
          count,
        };
      })
    );

    res.status(201).json(genreWithCounts);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGenreById = async (req, res) => {
  try {
    const genre = await Genre.findOne({ _id: req.params.id, user: req.userId, isDeleted: false });
    if (!genre) return res.status(404).json({ message: "Genre not found" });

    res.status(201).json(genre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateGenre = async (req, res) => {
  try {
    const genre = await Genre.findOneAndUpdate(
      { _id: req.params.id, user: req.userId, isDeleted: false },
      req.body,
      { new: true }
    );

    if (!genre) return res.status(404).json({ message: "Genre not found" });

    res.status(201).json(genre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteGenre = async (req, res) => {
  try {
    const genre = await Genre.findOneAndUpdate(
      { _id: req.params.id, user: req.userId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!genre) return res.status(404).json({ message: "Genre not found" });

    res.status(201).json({ message: "Genre deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addGenre,
  getGenre,
  getGenreById,
  updateGenre,
  deleteGenre,
};

