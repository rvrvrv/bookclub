/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, checkLoginState, FB, localStorage, location, Materialize */
'use strict';

//Show and hide progress bar
function progress(operation) {
    if (operation === 'show') $('.progress').removeClass('hidden');
    else $('.progress').addClass('hidden');
}

//Activate nav links
function activateLinks() {

    //Always activate logout button
    $('#logoutLink').click(() => {
        FB.logout(resp => checkLoginState());
        location.pathname = '/';
    });

    //If not on index page, activate title as button
    if (location.pathname.length > 1)
        $('.brand-logo').click(() => location.pathname = '/');

    /*Then, iterate through nav links, activating everything
    other than link to current page */
    $('.dynLink').each(function() {
        let link = $(this).data('link');
        if (link.includes('modal'))
            $(this).click(() => $(link).modal('open'));
        else if (!location.pathname.includes(link))
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

    //Generate user info in navbar
    $('#userInfo').html(`
        <a class="dropdown-button" data-beloworigin="true" data-activates="userDropdown">
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

    //Generate profile modal
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
    $('#editProfileBtn').click(() => editProfile());
    $('#cancelChangesBtn').click(() => resetProfile());
    //Initialize all modals
    $('.modal').modal();

    //If on homepage, update additional elements
    if (location.pathname === '/') {

        //Hide login button and change welcome message
        $('#loginBtn').hide();
        $('#welcome').html(`<h5 class="white-text center">You're in the club!<br>
            Feel free to <a class="dynLink light-blue-text text-lighten-4" data-link="addbook">add your own book</a>
            or <span class="light-blue-text text-lighten-4" id="requestText">request a trade</span>.</h5>`);
        $('#bottomInfo').html(`<h5 class="center">Select any book for more information.</h5>`);

        //Generate and initialize trade request collapsibles
        $('.requests').html(`
            <ul class="collapsible" data-collapsible="accordion">
                <li>
                    <div class="collapsible-header"><span class="badge" 
                        id="incomingCount" data-badge-caption="">0</span>
                        <i class="material-icons">announcement</i>Incoming Requests</div>
                    <div class="collapsible-body">
                        <div class="collection" id="incomingList"></div>
                    </div>
                </li>
                <li>
                    <div class="collapsible-header"><span class="badge"
                        id="outgoingCount">0</span>
                        <i class="material-icons">swap_vertical_circle</i>Outgoing Requests</div>
                    <div class="collapsible-body">
                        <div class="collection" id="outgoingList"></div>
                    </div>
                </li>
            </ul>`);
        $('.collapsible').collapsible();

        //Outgoing requests
        let outgoing = user.outgoingRequests;
        for (var i = 0; i < outgoing.length; i++) {
            //Update trade request button
            let link = $(`.req-btn[data-book="${outgoing[i].bookId}"][data-owner="${outgoing[i].userId}"]`);
            tradeReqUI(link, true);
        }

        //Incoming requests
        let incoming = user.incomingRequests;
        for (var i = 0; i < incoming.length; i++) {
            requestCount('incoming', 1);
            let req = incoming[i];
            $('#incomingList').append(`
                <p class="collection-item" data-book="${req.bookId}" 
                    data-user="${req.userId}">${req.title}
                    <a class="secondary-content tooltipped" data-tooltip="Reject trade"
                        onclick="answerTrade($(this).parent())">
                        <i class="material-icons small red-text">not_interested</i></a>
                        <span class="secondary-content black-text">&nbsp;&nbsp;</span>
                    <a class="secondary-content tooltipped" data-tooltip="Accept trade"
                        onclick="answerTrade($(this).parent(), true)">
                        <i class="material-icons small green-text">done</i></a>
                </p>`);
        }
        $('.tooltipped').tooltip();
    }

    //Change 'Request Trade' to 'Remove Book' for user's books in carousel
    user.books.forEach(e => {
        let reqBtn = $(`.req-btn[data-book="${e}"][data-owner="${user.id}"`);
        reqBtn.tooltip('remove');
        reqBtn.removeClass('waves-green').addClass('waves-red');
        reqBtn.attr('onclick', 'removeBook(this)');
        reqBtn.html('Remove Book');
        reqBtn.attr('data-tooltip', `Remove ${reqBtn.data('title')} from the collection`);
        $('.tooltipped').tooltip();
    });
}

//Handle 'Remove Book' link click
function removeBook(link, confirmed) {
    //First, ask for user confirmation
    if (!confirmed) {
        $(link).removeClass('waves-red').addClass('red white-text waves-light');
        $(link).html('Confirm Removal');
        $(link).attr('onclick', 'removeBook(this, true)');
    }
    else {
        progress('show');
        //When confirmed, delete book from DB
        let book = $(link).data('book');
        let apiUrl = `/api/book/${book}/${localStorage.getItem('rv-bookclub-id')}`;
        ajaxFunctions.ajaxRequest('DELETE', apiUrl, (data) => {
            console.log(data);
            //Remove book from carousel
            $(`.carousel-item[data-book="${book}"]`).remove();
            $('.carousel').removeClass('initialized');
            $('.carousel').carousel();
            //Close and remove book modal and tooltip
            $(`.modal[data-book="${book}"]`).modal('close');
            $(`.modal[data-book="${book}"]`).remove();
            $(link).tooltip('remove');
            //Notify the user
            Materialize.toast(`${$(link).data('title')} has been removed from the collection!`, 5000);
            progress('hide');
        });
    }
}
