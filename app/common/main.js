/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, FB, localStorage, Materialize */

$(document).ready(function() {
  $('.modal').modal();
});



function generateUI(user) {
    
    //Show user info in navbar
    $('#userInfo').html(`
    <a class="dropdown-button" data-beloworigin="true" href="#" data-activates="userDropdown">
    <li><img class="valign left-align" src="${user.picture.data.url}"
    alt="${user.first_name} ${user.last_name}"></li>
    <li class="hide-on-small-only">${user.first_name}</li></a>`);
    
    //Activate dropdown menu
    $('.dropdown-button').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrainWidth: false,
      hover: true,
      gutter: 0,
      belowOrigin: false,
      alignment: 'left',
      stopPropagation: false
    });
    
    //Create profile modal

    
    

    
}