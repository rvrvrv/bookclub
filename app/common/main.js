/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, checkLoginState, FB, localStorage, Materialize */

$(document).ready(function() {
        $('.modal').modal();
});



function generateUI(user, fullName) {
    
    //Generate user info in navbar
    $('#userInfo').html(`
        <a class="dropdown-button" data-beloworigin="true" href="#" data-activates="userDropdown">
        <li><img class="valign left-align" src="${user.picture.data.url}"
        alt="${user.first_name} ${user.last_name}"></li>
        <li class="hide-on-small-only">${user.first_name}</li></a>`);
    
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
                        <div class="input-field col s12 m6">
                            <i class="material-icons large prefix">account_circle</i>
                            <input value="${fullName}" id="name" type="text" class="validate"
                            pattern="[a-zA-Z][a-zA-Z0-9., ]{1,25}$">
                            <label class="active" for="name" data-error="Please enter a valid name.">Name</label>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s12 m6">
                            <i class="material-icons large prefix">my_location</i>
                            <input value="${user.location.name}" id="location" type="text" class="validate"
                            pattern="[a-zA-Z0-9., ]{2,25}$">
                            <label class="active" for="location" data-error="Please 
                            enter a valid location.">Location</label>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="modal-footer">
            <a class="waves-effect waves-green btn-flat" id="editProfileBtn">Save</a>
            <a class="modal-action modal-close waves-effect waves-red btn-flat">Cancel</a>
        </div>
    </div>`);
    $('.modal').modal();

}

//Confirm profile changes and save to DB
function editProfile() {
  
  
    
};
