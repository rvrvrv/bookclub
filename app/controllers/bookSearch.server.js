'use strict';

const books = require('google-books-search');

function search(reqBook, res) {
    books.search(reqBook, (err, results) => {
        if (err) return console.error(err);
        console.log(results);
        res.json(results);
    });
}        

module.exports = search;
