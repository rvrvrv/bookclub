/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, */
'use strict';

(function () {

   //Retrieve and display all books from DB
   function getAllBooks(data) {
       let books = JSON.parse(data);
       let carouselCode = '';
       let modalCode = '';
       console.log(books);
        books.forEach((e,i) => {
            carouselCode += `<a class="carousel-item tooltipped" href="#modal-${i}" data-tooltip="${e.title}" data-delay="600">
                <img src="${e.thumbnail}"></a>`;
            modalCode += `
                <div id="modal-${i}" class="modal modal-book">
                    <div class="modal-content">
                        <h4>${e.title}</h4>
                        <h5 class="authors">${e.authors}</h5>
                        <br>
                        <br>
                        <div class="row">
                            <div class="col s4">
                                <a href="${e.link}" target="_blank">
                                    <img src="${e.thumbnail}">
                                </a>
                            </div>
                            <div class="col s8">
                                <p>${e.description}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-fixed-footer right">
                        <a class="modal-action modal-close waves-effect waves-red btn-flat">Back</a>
                        <a class="waves-effect waves-green btn-flat">Request Trade</a>
                    </div>
                </div>`;
        });
       $('.carousel').html(carouselCode);
       $('.carousel').carousel();
       $('.modals').append(modalCode);
       //$('.modal').modal();
       $('.tooltipped').tooltip();
   }
   
   //Automatically show all books on index page
   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/api/allBooks/', getAllBooks));

})();