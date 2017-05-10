'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Book = new Schema({
	id: String,
	title: String,
	authors: [ String ],
    thumbnail: String,
    link: String
});

module.exports = mongoose.model('Books', Book);

