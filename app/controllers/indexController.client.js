/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, */
'use strict';

$(document).ready(() => {
    //Automatically show all books on index page
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', '/api/allBooks/', getAllBooks));

    //Check for ad-blocker, which disables FB login
    let test = document.createElement('div');
    test.className = 'adsbox';
    test.innerHTML = '&nbsp;';
    $('body').append(test);
    setTimeout(() => {
        if (test.offsetHeight === 0) 
            $('#welcome').after('<h4 class="red-text center">(Disable your AdBlocker for club entry)</h4>');
        test.remove();
    });
});


//Retrieve and display all books from DB
function getAllBooks(data) {
    let books = JSON.parse(data);
    let carouselCode = '';
    let modalCode = '';
    books.forEach((e, i) => {
        carouselCode += `<a class="carousel-item tooltipped dynLink" data-book="${e.id}" data-link="#modal-${i}" data-tooltip="${e.title}" data-delay="600">
                <img src="${e.thumbnail}"></a>`;
        modalCode += `
                <div id="modal-${i}" class="modal modal-book" data-book="${e.id}" data-owner="${e.owner}">
                    <div class="modal-content">
                        <h4>${e.title}</h4>
                        <h5 class="authors"><i class="fa fa-caret-right"></i>&nbsp;${e.authors}</h6>
                        <br>
                        <br>
                        <div class="row">
                            <div class="col m4 hide-on-small-only">
                                <a href="${e.link}" target="_blank">
                                    <img src="${e.thumbnail}">
                                </a>
                            </div>
                            <div class="col m8">
                                <p>${e.description}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-fixed-footer right">
                        <a class="modal-action modal-close waves-effect waves-light btn-flat">Back</a>
                        <a class="req-btn waves-effect waves-green btn-flat tooltipped" data-tooltip="Request ${e.title}" 
                            data-book="${e.id}" data-owner="${e.owner}" data-title="${e.title}" data-modal="${i}"
                            onclick="reqTrade(this, true)">Request Trade</a>
                    </div>
                </div>`;
    });
    $('.carousel').html(carouselCode);
    $('.carousel').carousel({
        shift: 20
    });
    $('.modals').append(modalCode);
    $('.tooltipped').tooltip();
}
