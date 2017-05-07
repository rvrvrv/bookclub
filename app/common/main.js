/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, FB, localStorage, Materialize */

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
        <li><a class="waves-effect waves-green" href="#!">Log Out</a></li>`);
    
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
                        <div class="input-field col s9">
                            <input value="${fullName}" id="name" type="text" class="validate">
                            <label class="active" for="name">Name</label>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s9">
                            <input value="${user.location.name}" id="location" type="text" class="validate">
                            <label class="active" for="location">Location</label>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="modal-footer">
            <a href="#!" class="modal-action modal-close waves-effect waves-green btn-flat">Save</a>
        </div>
    </div>`);
    $('.modal').modal();

}

