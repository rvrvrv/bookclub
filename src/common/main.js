// Show and hide progress bar
function progress(operation) {
  if (operation === 'show') $('.progress').removeClass('hidden');
  else $('.progress').addClass('hidden');
}

// Restore modal buttons upon close
function restoreBtns() {
  // Only perform this operation if 'Confirm Removal' button exists
  if ($('.req-btn').hasClass('confirm-rm-btn')) {
    const btn = $('.confirm-rm-btn');
    btn.html('Remove Book');
    btn.attr('onclick', 'removeBook(this)');
    btn.removeClass('red white-text waves-light confirm-rm-btn').addClass('waves-red');
  }
}

// Activate nav links
function activateLinks() {
  // Always activate logout button
  $('#logoutLink').click(() => {
    FB.logout(resp => checkLoginState(true));
  });

  // If not on index page, activate title as button
  if (location.pathname.length > 1) { $('.brand-logo').click(() => location.pathname = '/'); }

  // Then, iterate through nav links and activate everything other than link to current page
  $('.dyn-link').each(function () {
    const link = $(this).data('link');
    if (link.includes('modal'))	$(this).click(() => $(link).modal('open'));
    else if (!location.pathname.includes(link)) $(this).click(() => location.href = `${link}.html`);
  });
}

// Generate UI for logged-in users
function generateLoggedInUI(user, picture) {
  // Generate user info in navbar
  $('#userInfo').html(`
        <a class="dropdown-button" data-beloworigin="true" data-activates="userDropdown">
        <li><img class="valign left-align" src="${picture}"
        alt="${user.name}" id="navImg"></li>
        <li class="hide-on-small-only" id="navName">${user.name.split(' ')[0]}</li></a>`);

  // Generate dropdown menu
  $('#userDropdown').html(`
        <li><a class="waves-effect waves-green dyn-link" data-link="addbook">Add a Book</a></li>
        <li><a class="modal-trigger waves-effect waves-green" data-target="profileModal">Edit Profile</a></li>
        <li class="divider"></li>
        <li><a class="waves-effect waves-green" id="logoutLink">Log Out</a></li>`);

  // Initialize dropdown menu
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

  // Generate profile modal
  $('.modals').append(`
    <div id="profileModal" class="modal bottom-sheet">
      <div class="modal-content">
        <h5>Edit Profile</h5>
        <div class="row">
          <form class="col s12">
            <div class="row">
              <div class="input-field col s12 m9 l6">
                <i class="material-icons large prefix">account_circle</i>
                <input id="profileName" value="${user.name}" alt="${user.name}" type="text" class="validate" pattern="[a-zA-Z][a-zA-Z0-9., ]{1,25}$">
                <label class="active" for="profileName" data-error="Please enter a valid name.">Name</label>
              </div>
            </div>
            <div class="row">
              <div class="input-field col s12 m9 l6">
                <i class="material-icons large prefix">my_location</i>
                <input id="profileLocation" value="${user.location}" alt="${user.location}" type="text" class="validate"
                  pattern="[a-zA-Z0-9., ]{2,25}$">
                <label class="active" for="profileLocation" data-error="Please enter a valid location.">Location</label>
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
  // Initialize all modals
  $('.modal').modal({
    complete: () => restoreBtns()
  });

  // If on homepage, update additional elements
  if (location.pathname === '/') {
    // Hide login button and change welcome message
    $('.fb-login-button').hide();
    $('#welcome').html(`<h5 class="white-text center">You're in the club!<br>
            Feel free to <a class="dyn-link light-blue-text text-lighten-4" data-link="addbook">add a book</a>
            or <span class="light-blue-text text-lighten-4 request-text">request a trade</span>.</h5>`);
    $('#bottomInfo').html('<h5 class="center">Select any book for more information.</h5>');
    // Activate 'request a trade' text
    $('.request-text').click(() => {
      $('.carousel').addClass('shake');
      setTimeout(() => $('.carousel').removeClass('shake'), 1000);
    });

    // Generate and initialize all collapsibles
    $('.requests').html(`
      <ul class="collapsible" data-collapsible="accordion">
      <li>
        <div class="collapsible-header"><span class="badge incoming-count" data-badge-caption="">0</span>
          <i class="material-icons">announcement</i>Incoming Requests</div>
        <div class="collapsible-body">
          <div class="collection" id="incomingList"></div>
        </div>
      </li>
      <li>
        <div class="collapsible-header"><span class="badge outgoing-count">0</span>
          <i class="material-icons">swap_vertical_circle</i>Outgoing Requests</div>
        <div class="collapsible-body">
          <div class="collection" id="outgoingList"></div>
        </div>
      </li>
      <li>
        <div class="collapsible-header">
          <i class="material-icons">view_module</i>Your Books</div>
        <div class="collapsible-body">
          <div class="collection" id="personalList"></div>
        </div>
      </li>
    </ul>`);
    $('.collapsible').collapsible();

    // Incoming requests
    const incoming = user.incomingRequests;
    for (let i = 0; i < incoming.length; i++) {
      requestCount('incoming', 1);
      const req = incoming[i];
      $('#incomingList').append(`
        <p class="collection-item" data-book="${req.bookId}" data-user="${req.userId}">
          <a onclick="openModal($(this).parent())">${req.title}</a>
          <a class="secondary-content tooltipped" data-tooltip="Reject trade" onclick="answerTrade($(this).parent())">
            <i class="material-icons small red-text">not_interested</i>
          </a>
          <span class="secondary-content black-text">&nbsp;&nbsp;</span>
          <a class="secondary-content tooltipped" data-tooltip="Accept trade" onclick="answerTrade($(this).parent(), true)">
            <i class="material-icons small green-text">done</i>
          </a>
        </p>`);
    }

    // Outgoing requests
    const outgoing = user.outgoingRequests;
    for (let j = 0; j < outgoing.length; j++) {
      // Update trade request button
      const link = $(`.req-btn[data-book="${outgoing[j].bookId}"][data-owner="${outgoing[j].userId}"]`);
      tradeReqUI(link, true);
    }

    $('.tooltipped').tooltip();
  }

  // Update buttons and collapsibles for books in user's collection
  user.books.forEach((e) => {
    // Change 'Request Trade' to 'Remove Book' for user's books in carousel
    const reqBtn = $(`.req-btn[data-book="${e}"][data-owner="${user.id}"]`);
    const title = reqBtn.data('title');
    reqBtn.tooltip('remove');
    reqBtn.removeClass('waves-green').addClass('waves-red');
    reqBtn.attr('onclick', 'removeBook(this)');
    reqBtn.attr('data-tooltip', `Remove ${title} from the collection`);
    reqBtn.html('Remove Book');


    // Add user's books to collapsible
    $('#personalList').append(`
      <a class="collection-item blue-text tooltipped" data-book="${e}" data-user="${user.id}" data-tooltip="View ${title} and/or remove it from the collection" onclick="openModal($(this), true)">${title}</a>`);
    $('.tooltipped').tooltip();
  });

  // Activate all dynamic links
  activateLinks();
}

// Helper to open modals from collapsibles
function openModal(link, trueOwner) {
  const owner = trueOwner ? link.data('user') : localStorage.getItem('rv-bookclub-id');
  const bookModal = $(`.modal-book[data-book="${link.data('book')}"][data-owner="${owner}"]`);
  bookModal.modal('open');
}

// Handle 'Remove Book' link click
function removeBook(link, confirmed) {
  // First, ask for user confirmation
  if (!confirmed) {
    $(link).removeClass('waves-red').addClass('red white-text waves-light confirm-rm-btn');
    $(link).html('Confirm Removal');
    $(link).attr('onclick', 'removeBook(this, true)');
  } else {
    progress('show');
    // When confirmed, delete book from DB
    const book = $(link).data('book');
    const apiUrl = `/api/book/${book}/${localStorage.getItem('rv-bookclub-id')}`;
    ajaxFunctions.ajaxRequest('DELETE', apiUrl, (data) => {
      console.log(data);
      // Remove book from carousel
      $(`.carousel-item[data-book="${book}"]`).remove();
      $('.carousel').removeClass('initialized');
      $('.carousel').carousel();
      // Close and remove book modal and tooltip
      $(`.modal[data-book="${book}"]`).modal('close');
      $(`.modal[data-book="${book}"]`).remove();
      $(link).tooltip('remove');
      // Notify the user
      Materialize.toast(`${$(link).data('title')} has been removed from the collection!`, 5000);
      progress('hide');
    });
  }
}
