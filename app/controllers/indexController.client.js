/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, */
'use strict';

(function () {

   //Retrieve and display all books from DB
   function getAllBooks(data) {
       let books = JSON.parse(data);
       let formattedOutput = '';
       console.log(books);
        books.forEach((e) => {
            console.log(e);
            formattedOutput += `<h6>${e.title} by ${e.authors}</h6>`;
        });
       
       $('#allBooks').html(formattedOutput);
   }
   
   //Automatically show all books on index page
   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/api/allBooks/', getAllBooks));

})();