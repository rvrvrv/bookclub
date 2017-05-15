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
            formattedOutput += `<a class="carousel-item tooltipped" href="${e.link}" target="_blank" data-tooltip="${e.title}" data-delay="600">
                <img src="${e.thumbnail}"></a>`;
        });
       $('.carousel').html(formattedOutput);
       $('.carousel').carousel();
       $('.tooltipped').tooltip();
   }
   
   //Automatically show all books on index page
   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/api/allBooks/', getAllBooks));

})();