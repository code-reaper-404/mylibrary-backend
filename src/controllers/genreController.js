const Genre = require("../models/Genre");

const addGenre = async (req, res) => {
  try {
    const genre = await Genre.create({ ...req.body, user: req.userId });
    res.status(201).json(genre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGenre = async (req, res) => {
  try {
    const genres = await Genre.find({ user: req.userId });
    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addGenre, getGenre };
