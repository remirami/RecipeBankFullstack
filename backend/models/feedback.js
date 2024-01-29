const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  type: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
