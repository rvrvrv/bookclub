/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, FB, localStorage, Materialize */
'use strict';

const $btn = $('#searchBtn');
const goingText = '&nbsp;<i class="fa fa-2x fa-star"></i>&nbsp;Going!</a>';
const attendText = 'Attend&nbsp;<i class="fa fa-2x fa-star-o"></i></a>';
let lastSearch = '';
let timer;

//Populate page with search results (called from search function)
function displayBusinesses(data) {
   let list = JSON.parse(data);
   //Clear previous search results and timer
   $('#results').empty();
   clearTimeout(timer);
   //Display the results
   list.forEach((e, i) => {
      //Convert and round distance (in meters) to miles
      let distance = (e.distance * 0.000621371192).toFixed(1);
      //If necessary, replace blank business image with placeholder
      let imgUrl = (!e.image_url) ? '/public/img/blank.png' : e.image_url;
      
      //Display results with staggered animation
      setTimeout(() => {
         $('#results').append(`
               <div class="col m6 l4 card-div animated fadeIn">
                  <div class="card small black">
                     <div class="card-image waves-effect waves-block waves-light">
                        <img class="activator business-img" src="${imgUrl}" alt="${e.name}">
                     </div>
                     <div class="card-content black">
                        <span class="card-title activator white-text">${e.name}
                        <i class="material-icons right">more_vert</i></span>
                        <p>${distance} mi.
                        <a class="attendLink right hidden" id="${e.id}" href="javascript:;" onclick="attend(this, true)">${attendText}</a>
                        <br>
                      </div>
                      <div class="card-reveal black">
                        <span class="card-title white-text">${e.name}
                        <i class="material-icons right">close</i></span>
                        <p>${e.location.display_address.join('<br>')}
                           <br><a href="tel:${e.phone}" target="_blank">${e.display_phone}</a>
                        </p>
                        <p><a class="yelp" href="${e.url}" target="_blank">View on <img class="yelp-logo" src="/public/img/yelp.png" alt="Yelp"></a></p>
                        <p class="attendance"><span id="${e.id}-attendance">0</span>&nbsp;going</p>
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
function search(location) {
   //First, ensure search field is populated and doesn't contain invalid characters
   if (!location.trim() || location.match(/[^a-zA-Z0-9.,\-\s]/)) 
      return Materialize.toast('Please enter a valid location', 3000, 'error');
   //Then, ensure user entered a new location (to prevent duplicate requests)
   if (location.trim().toLowerCase() === lastSearch) 
      return Materialize.toast('Please enter a new location', 3000, 'error');
   
   //Update the UI and perform the search
   $('.card-div').addClass('fadeOut');
   $('.progress').removeClass('hidden');
   $btn.addClass('disabled');
   $btn.html('<i class="fa fa-spinner fa-spin fa-fw"></i>');
   ajaxFunctions.ajaxRequest('GET', `/api/list/${location}`, displayBusinesses);
   lastSearch = location.trim().toLowerCase();
  
  //7-second timer to prevent search hang-up
   timer = setTimeout(() => {
         Materialize.toast('Search took too long. Please try again.', 3000, 'error');
         lastSearch = '';
         $('#locationInput').val('');
         $('.progress').addClass('hidden');
         $btn.removeClass('disabled');
         $btn.html('Search');
   }, 7000);
}

//Check all search results for attendance stats
function checkAll() {
   let userId = localStorage.getItem('rv-bookclub-id') || null;
   $('.attendLink').each(function() {
      ajaxFunctions.ajaxRequest('GET', `/api/attend/${$(this)[0].id}/${userId}`, res => {
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

//Handle attend link click
function attend(link, interested) {
   let userId = localStorage.getItem('rv-bookclub-id');
   //First, check to see if user is logged in
   if (!userId) {
      $('.fb-buttons').addClass('shake');
      setTimeout(() => $('.fb-buttons').removeClass('shake'), 1000);
      return Materialize.toast('Please log in to attend events', 2000, 'error');
   }
   //Then, update the database (attend or unattend the location)
   let method = interested ? 'PUT' : 'DELETE';
   ajaxFunctions.ajaxRequest(method, `/api/attend/${link.getAttribute('id')}/${userId}`, updateAttending);
}

//Handle search button click
$btn.click(() => search($('#locationInput').val()));

//Handle enter-key submission from search field
$('#locationForm').on('submit', e => {
   e.preventDefault();
   search($('#locationInput').val());
});
