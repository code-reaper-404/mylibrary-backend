const mongoose = require("mongoose");

const bookshelfSchema = new mongoose.Schema({
  title: String,
  author: String,
  genre: { type: mongoose.Schema.Types.ObjectId, ref: "Genre" },
  pages:String,
  price:Number,
  language:String,
  year:String,
  description:String,
  source:String,
  status:Number,
  isDeleted:Boolean,
  bookList:String,
  imageURL:String,
  rating: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("bookshelf", bookshelfSchema);
