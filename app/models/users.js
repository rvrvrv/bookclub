'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    id: String,
    name: String,
    location: String,
    books: [{
        bookId: String,
    }],
    outgoingRequests: [{
        bookId: String
    }],
    incomingRequests: [{
        bookId: String
    }]
});

module.exports = mongoose.model('User', User);