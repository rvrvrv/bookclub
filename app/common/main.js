/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, checkLoginState, FB, localStorage, Materialize */

$(document).ready(function() {
        $('.modal').modal();
});



function generateLoggedInUI(user, picture) {
    
    //Hide login button and welcome message
    $('#loginBtn').hide();
    $('#welcome').hide();
        
    //Generate user info in navbar
    $('#userInfo').html(`
        <a class="dropdown-button" data-beloworigin="true" href="#" data-activates="userDropdown">
        <li><img class="valign left-align" src="${picture}"
        alt="${user.name}" id="navImg"></li>
        <li class="hide-on-small-only" id="navName">${user.name.split(' ')[0]}</li></a>`);
    
    //Generate dropdown menu
    $('#userDropdown').html(`
        <li><a class="waves-effect waves-green" href="/public/addbook.html">Add a Book</a></li>
        <li><a class="modal-trigger waves-effect waves-green" data-target="profileModal">Edit Profile</a></li>
        <li class="divider"></li>
        <li><a class="waves-effect waves-green" id="logoutLink">Log Out</a></li>`);
    
    //Activate logout link
    $('#logoutLink').click(() => FB.logout(resp => checkLoginState()));
    
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
    $('.modals').html(`
      <div id="profileModal" class="modal bottom-sheet">
        <div class="modal-content">
            <h5>Edit Profile</h5>
            <br><br>
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
        
    //If changes have been made, update the user's profile in the DB
    ajaxFunctions.ajaxRequest('PUT', 
        `/api/user/${localStorage.getItem('rv-bookclub-id')}/${$('#profileName').val()}/${$('#profileLocation').val()}`, res => {
         let result = JSON.parse(res);
         
         //Update UI with new user info
         $('#navName').html(`${result.name.split(' ')[0]}`);
         $('#navImg').attr('alt', `${result.name}`);
         $('#profileName').val(`${result.name}`);
         $('#profileLocation').val(`${result.location}`);
         
         //Close modal and notify the user
         $('#profileModal').modal('close');
         Materialize.toast('Your profile has been updated!', 3000);
    });
    
}

//Cancel profile changes
function resetProfile() {

    //Restore original profile values
    $('#profileName').val($('#profileName').attr('alt'));
    $('#profileLocation').val($('#profileLocation').attr('alt'));
    
    //Close modal and notify the user
    $('#profileModal').modal('close');
    Materialize.toast('No changes have been made.', 2000);
    
}
