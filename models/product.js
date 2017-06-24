var mongoose = require("mongoose"),
    mongoosastic = require("mongoosastic");

var ProductSchema = new mongoose.Schema({
  category: {type: mongoose.Schema.Types.ObjectId, ref: "Category"},
  name: String,
  description: String,
  price: Number,
  image: String,
  reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

ProductSchema.plugin(mongoosastic, {
  hosts: [
  "localhost:9200" //default number of mongoosastic
  ]
});

module.exports = mongoose.model("Product", ProductSchema);
