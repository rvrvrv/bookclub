const mongoose = require('mongoose');
const { Schema } = mongoose.Schema;

const User = new Schema({
  id: String,
  name: String,
  location: String,
  books: [String],
  outgoingRequests: [{
    bookId: String,
    userId: String,
    title: String
  }],
  incomingRequests: [{
    bookId: String,
    userId: String,
    title: String
  }]
});

module.exports = mongoose.model('User', User);
