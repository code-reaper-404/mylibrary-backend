const mongoose = require("mongoose");

const genreSchema = new mongoose.Schema({
    name:String,
    isDeleted: Boolean,
    color:String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Genre", genreSchema);
