var mongoose = require("mongoose");

//SCHEMA SETUP

//Creates the schema
var reviewSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  rating: Number
});

//Creates the model
module.exports = mongoose.model("Review", reviewSchema);
