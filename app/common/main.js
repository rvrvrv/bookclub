/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, checkLoginState, FB, localStorage, location, Materialize */

var tradeRequest = {};

//Show and hide progress bar
function progress(operation) {
    if (operation === 'show') $('.progress').removeClass('hidden');
    else $('.progress').addClass('hidden');
}

//Activate nav links
function activateLinks() {
    
    let currentLoc = location.pathname;  
        
    //Always activate logout button
    $('#logoutLink').click(() => {
        FB.logout(resp => checkLoginState());
        location.pathname = '/';
    });
    
    //If not on index page, activate title as button
    if (currentLoc.length > 1) 
        $('.brand-logo').click(() => location.pathname = '/');

    /*Then, iterate through nav links, activating everything
    other than link to current page */
    $('.dynLink').each(function() {
        let link = $(this).data('link');
        if (link.includes('modal'))
            $(this).dblclick(() => $(link).modal('open'));
        else if (!currentLoc.includes(link))
            $(this).click(() => location.href = `${link}.html`);
    });
    
    //Trigger animation when user clicks 'request a trade'
    $('#requestText').click(() => {
        $('.carousel').addClass('shake');
        setTimeout(() => $('.carousel').removeClass('shake'), 2000);
    });
}

//Generate UI for logged-in users
function generateLoggedInUI(user, picture) {
    
    //Hide login button and change welcome message
    $('#loginBtn').hide();
    $('#welcome').html(`<h5 class="white-text center">You're in the club!<br>
        Feel free to <a class="dynLink light-blue-text text-lighten-4" data-link="addbook">add your own book</a>
        or <span class="light-blue-text text-lighten-4" id="requestText">request a trade</span>.</h5>`);
    $('#bottomInfo').html(`<h5 class="center">Double-click any book for more information.</h5>`);
     
    //Generate user info in navbar
    $('#userInfo').html(`
        <a class="dropdown-button" data-beloworigin="true" href="#" data-activates="userDropdown">
        <li><img class="valign left-align" src="${picture}"
        alt="${user.name}" id="navImg"></li>
        <li class="hide-on-small-only" id="navName">${user.name.split(' ')[0]}</li></a>`);
    
    //Generate dropdown menu
    $('#userDropdown').html(`
        <li><a class="waves-effect waves-green dynLink" data-link="addbook">Add a Book</a></li>
        <li><a class="modal-trigger waves-effect waves-green" data-target="profileModal">Edit Profile</a></li>
        <li class="divider"></li>
        <li><a class="waves-effect waves-green" id="logoutLink">Log Out</a></li>`);
    
    //Activate menu links
    activateLinks();
    
    //Initialize dropdown menu
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
    
    //Generate and initialize profile modal
    $('.modals').append(`
      <div id="profileModal" class="modal bottom-sheet">
        <div class="modal-content">
            <h5>Edit Profile</h5>
            <div class="row">
                <form class="col s12">
                    <div class="row">
                        <div class="input-field col s12 m9 l6">
                            <i class="material-icons large prefix">account_circle</i>
                            <input id="profileName" value="${user.name}" alt="${user.name}" type="text" class="validate"
                            pattern="[a-zA-Z][a-zA-Z0-9., ]{1,25}$">
                            <label class="active" for="profileName" data-error="Please enter a valid name.">Name</label>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s12 m9 l6">
                            <i class="material-icons large prefix">my_location</i>
                            <input id="profileLocation" value="${user.location}" alt="${user.location}" type="text" class="validate"
                            pattern="[a-zA-Z0-9., ]{2,25}$">
                            <label class="active" for="profileLocation" data-error="Please 
                            enter a valid location.">Location</label>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="modal-footer">
            <a class="waves-effect waves-green btn-flat" id="editProfileBtn">Save</a>
            <a class="waves-effect waves-red btn-flat" id="cancelChangesBtn">Cancel</a>
        </div>
    </div>`);
    $('.modal').modal();
    
    //Activate edit-profile buttons
    $('#editProfileBtn').click(() => editProfile());
    $('#cancelChangesBtn').click(() => resetProfile());
    
}

//Save profile changes to DB
function editProfile() {

    //First, ensure changes have been made
    if ($('#profileName').attr('alt') === $('#profileName').val() && 
        $('#profileLocation').attr('alt') === $('#profileLocation').val()) {
            return Materialize.toast('No changes have been made.', 2000);  
        }
    
    //Then, ensure changes are valid
    if ($('input').hasClass('invalid')) 
        return Materialize.toast('Invalid information.', 2000, 'error');
        
    //If changes have been made, update the user's profile in the DB
    progress('show');
    ajaxFunctions.ajaxRequest('PUT', 
        `/api/user/${localStorage.getItem('rv-bookclub-id')}/${$('#profileName').val()}/${$('#profileLocation').val()}`, res => {
         let result = JSON.parse(res);
         
         //Update UI with new user info
         $('#navName').html(`${result.name.split(' ')[0]}`);
         $('#navImg').attr('alt', `${result.name}`);
         $('#profileName').val(`${result.name}`);
         $('#profileName').attr('alt', `${result.name}`);
         $('#profileLocation').val(`${result.location}`);
         $('#profileLocation').attr('alt', `${result.location}`);
         
         //Close modal and notify the user
         $('#profileModal').modal('close');
         Materialize.toast('Your profile has been updated!', 2000);
         progress('hide');
    });
    
}

//Cancel profile changes
function resetProfile() {

    //Restore original profile values
    $('#profileName').val($('#profileName').attr('alt'));
    $('#profileLocation').val($('#profileLocation').attr('alt'));
    $('input').removeClass('invalid');
    
    //Close modal and notify the user
    $('#profileModal').modal('close');
    Materialize.toast('No changes have been made.', 2000);
    
}

//Handle 'Request Trade' / 'Cancel Request' link click
function reqTrade(link, interested) {
    
    //Store book trade information
    tradeRequest = {
        book: $(link).data('book'),
        owner: $(link).data('owner'),
        user: localStorage.getItem('rv-bookclub-id')
        };
        
    //First, ensure the user isn't requesting their own book
    if (tradeRequest.owner === tradeRequest.user)
        return Materialize.toast('This is your book!', 3000, 'error');
    
    let method = interested ? 'POST' : 'DELETE';
    ajaxFunctions.ajaxRequest(method, `/api/trade/${JSON.stringify(tradeRequest)}`, (res) => {
        //Update UI
        if (interested) {
            Materialize.toast('Trade requested!', 3000);
            $(link).html('Cancel Request');
            $(link).attr('data-tooltip', 'Cancel trade request');
            $(link).attr('onclick', 'reqTrade(this)');
        } 
        else {
            Materialize.toast('Trade cancelled!', 3000);
            $(link).html('Request Trade');  
            $(link).attr('data-tooltip',  `Request ${$(link).data('title')}`);
            $(link).attr('onclick', 'reqTrade(this, true)');
        }
        $('.tooltipped').tooltip();
        progress('hide');
    });

}