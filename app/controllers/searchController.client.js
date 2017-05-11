/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, FB, localStorage, Materialize */
'use strict';

const $btn = $('#searchBtn');
let lastSearch = '';
let timer;


//Populate page with search results (called from search function)
function displaySearchResults(data) {
   let list = JSON.parse(data);
   console.log(list);
   //Clear previous search results and timer
   $('#results').empty();
   clearTimeout(timer);
   //Display the results
   list.forEach((e, i) => {
      //Display results with staggered animation
      setTimeout(() => {
         $('#results').append(`
              <div class="col s12 l6 animated fadeIn result" id="${e.id}">
                <h5>${e.title}</h5>
                <h6 class="authors"><i class="fa fa-caret-right"></i>&nbsp;${e.authors}</h6>
                <div class="card horizontal short">
                  <div class="card-image">
                    <img src="${e.thumbnail}" alt="${e.title}">
                  </div>
                  <div class="card-stacked">
                    <div class="card-content">
                      <p>${e.description}</p>
                      <a class="btn-floating halfway-fab waves-effect waves-light blue" id="${e.id}" href="javascript:;" onclick="addBook(this, true)">
                        <i class="material-icons">add</i>
                      </a>
                    </div>
                    <div class="card-action">
                      <a class="bookLink" href="${e.link}" target=_blank>More Info</a>
                    </div>
                  </div>
                </div>
              </div>
         `);
      }, i * 80);
   });

   //After all results are displayed, update attendance stats and UI
      setTimeout(() => {
         checkAll();
         $('.progress').addClass('hidden');
         $btn.removeClass('disabled');
         $btn.html('Search');
      }, list.length * 100);
}

//Search for results via GET request
function search(book) {
   //First, ensure search field is populated
   if (!book.trim()) 
      return Materialize.toast('Please enter a book title', 3000, 'error');
   //Then, ensure user entered a new location (to prevent duplicate requests)
   if (book.trim().toLowerCase() === lastSearch) 
      return Materialize.toast('Please enter a new book', 3000, 'error');
   
   //Update the UI and perform the search
   $('.card-div').addClass('fadeOut');
   $('.progress').removeClass('hidden');
   $btn.addClass('disabled');
   $btn.html('<i class="fa fa-spinner fa-spin fa-fw"></i>');
   ajaxFunctions.ajaxRequest('GET', `/api/search/${book}`, displaySearchResults);
   lastSearch = book.trim().toLowerCase();
  
  //7-second timer to prevent search hang-up
   timer = setTimeout(() => {
         Materialize.toast('Search took too long. Please try again.', 3000, 'error');
         lastSearch = '';
         $('#bookInput').val('');
         $('.progress').addClass('hidden');
         $btn.removeClass('disabled');
         $btn.html('Search');
   }, 7000);
}

//Check all search results for attendance stats
function checkAll() {
   let userId = localStorage.getItem('rv-bookclub-id') || null;
   $('.attendLink').each(function() {
      ajaxFunctions.ajaxRequest('GET', `/api/book/${$(this)[0].id}/${userId}`, res => {
         let results = JSON.parse(res);
         //If no data in DB, there are no stats to update
         if (!results) return $(this).addClass('animated fadeInUp').removeClass('hidden');
         //Otherwise, update the link and attendance stats
         let userAction = (results.attendees.includes(userId)) ? 'attending' : 'no';
         updateAttending({
               location: results.location,
               total: results.attendees.length,
               action: userAction
            });
      });
   });
}

//Display user and guest attendance for each business
function updateAttending(data) {
   //If data is from server, parse the string
   let results = (typeof(data) === 'string') ? JSON.parse(data) : data;
   let $loc = $(`#${results.location}`);
   //Update link text and action based on attendance
   if (results.action === 'attending') {
      $loc.html(goingText);
      $loc.attr('onclick', 'attend(this)');
   }
   else {
      $loc.html(attendText);
      $loc.attr('onclick', 'attend(this, true)');
   }
   //Display the link
   $loc.addClass('animated fadeInUp').removeClass('hidden');
   //Update attendance count
   $(`#${results.location}-attendance`).html(results.total);
}

//Handle 'Add Book' link click
function addBook(link, interested) {
   let userId = localStorage.getItem('rv-bookclub-id');
   //First, check to see if user is logged in
   if (!userId) {
      $('.fb-buttons').addClass('shake');
      setTimeout(() => $('.fb-buttons').removeClass('shake'), 1000);
      return Materialize.toast('Please log in to add this book to your collection', 2000, 'error');
   }
   //Then, update the database (add or remove the book)
   let method = interested ? 'PUT' : 'DELETE';
   ajaxFunctions.ajaxRequest(method, `/api/book/${link.getAttribute('id')}/${userId}`, updateAttending);
}

//Handle search button click
$btn.click(() => search($('#bookInput').val()));

//Handle enter-key submission from search field
$('#bookForm').on('submit', e => {
   e.preventDefault();
   search($('#bookInput').val());
});
