var mongoose = require('mongoose');

var ImageSchema = new mongoose.Schema({
  user_id: String,
  src: String
});

module.exports = mongoose.model('Image', ImageSchema);
