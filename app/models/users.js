'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    id: String,
    name: String,
    location: String,
    books: [ String ],
    outgoingRequests: [{
        bookId: String,
        userId: String
    }],
    incomingRequests: [{
        bookId: String,
        userId: String
    }]
});

module.exports = mongoose.model('User', User);