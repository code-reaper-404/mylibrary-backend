const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    action: {
      type: String,
    //   enum: ["ADD", "DELETE", "UPDATE_STATUS","EDIT"], // restrict to known actions
      required: true,
    },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "bookshelf", required: true }, // reference book
    previousStatus: { type: String }, // for tracking old status
    newStatus: { type: String },      // for tracking new status
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who performed action
  },
  { timestamps: true }
);

module.exports = mongoose.model("History", historySchema);
