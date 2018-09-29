const mongoose = require('mongoose');
const { Schema } = mongoose;

const Book = new Schema({
  id: String,
  title: String,
  authors: [String],
  thumbnail: String,
  link: String,
  description: String,
  owner: String
});

module.exports = mongoose.model('Books', Book);
