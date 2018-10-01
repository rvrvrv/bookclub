// Handle 'Accept Trade' / 'Reject Trade' link click
function answerTrade(link, accept) {
  progress('show');

  // Store book trade information
  const tradeRequest = {
    book: $(link).data('book'),
    owner: localStorage.getItem('rv-bookclub-id'),
    user: $(link).data('user')
  };

  // Make the appropriate API call
  const method = accept ? 'PUT' : 'DELETE';

  ajaxFunctions.ajaxRequest(method, `/api/trade/${JSON.stringify(tradeRequest)}`, (res) => {
    // After DB changes are complete, update UI
    if (accept) {
      Materialize.toast('Trade accepted!', 4000);
      // Remove collapsible
      $(`#personalList .collection-item[data-book="${tradeRequest.book}"][data-user="${tradeRequest.owner}"]`).remove();
      // Update button
      const reqBtn = $(`.req-btn[data-book="${tradeRequest.book}"][data-owner="${tradeRequest.owner}"`);
      reqBtn.html('Traded!');
      reqBtn.addClass('disabled');
    } else Materialize.toast('Trade rejected!', 4000);

    // Remove request collapsible and update count
    $(link).remove();
    $($(link).children()).tooltip('remove');
    $('.collapsible').collapsible('close', 0);
    requestCount('incoming', -1);
    progress('hide');
  });
}

// Update Trade Request button and collapsible
function tradeReqUI(link, requested) {
  // Store book information
  const title = $(link).data('title');
  const bookId = $(link).data('book');
  const owner = $(link).data('owner');
  const modalLink = `#modal-${$(link).data('modal')}`;

  if (requested) {
    // Update link in book modal
    $(link).html('Cancel Request');
    $(link).data('tooltip', 'Cancel trade request');
    $(link).attr('onclick', 'reqTrade(this)');
    $(link).removeClass('waves-green').addClass('waves-orange');
    // Create link in outgoing requests collapsible
    requestCount('outgoing', 1);
    $('#outgoingList').append(`
            <a class="collection-item blue-text tooltipped" data-book="${bookId}" 
            data-owner="${owner}" data-tooltip="View ${title} and/or cancel request"
            onclick="$('${modalLink}').modal('open');">${title}</a>`);
  } else {
    // Update link in book modal
    $(link).html('Request Trade');
    $(link).data('tooltip', `Request ${title}`);
    $(link).attr('onclick', 'reqTrade(this, true)');
    $(link).removeClass('waves-orange').addClass('waves-green');
    // Delete link in outgoing requests collapsible
    requestCount('outgoing', -1);
    $(`.collection-item[data-book="${bookId}"][data-owner="${owner}"]`).remove();
  }
  $('.tooltipped').tooltip();
}

// Handle 'Request Trade' / 'Cancel Request' link click
function reqTrade(link, interested) {
  // Store book trade information
  const tradeRequest = {
    book: $(link).data('book'),
    owner: $(link).data('owner'),
    user: localStorage.getItem('rv-bookclub-id'),
    title: $(link).data('title')
  };

  // First, ensure the user isn't requesting their own book
  if (tradeRequest.owner === tradeRequest.user) return Materialize.toast('This is your book!', 3000, 'error');

  // If the trade request is valid, update UI
  $(link).addClass('disabled');
  progress('show');

  // Make the appropriate API call
  const method = interested ? 'POST' : 'DELETE';

  ajaxFunctions.ajaxRequest(method, `/api/trade/${JSON.stringify(tradeRequest)}`, (res) => {
    // After DB changes are complete, update UI
    if (interested) {
      Materialize.toast('Trade requested!', 4000);
      tradeReqUI(link, true);
    } else {
      Materialize.toast('Trade request cancelled!', 4000);
      tradeReqUI(link);
    }
    $(link).removeClass('disabled');
    progress('hide');
    setTimeout(() => $('.modal').modal('close'), 500);
  });
}

// Add or subtract from request count
function requestCount(reqType, num) {
  const count = +$(`.${reqType}-count`).html() + num;
  // Update count
  $(`.${reqType}-count`).html(count);
  // When updating incoming requests, update the badge color as necessary
  if (reqType === 'incoming') {
    if (count > 0) $('.incoming-count').addClass('new light-blue darken-3');
    if (count === 0) $('.incoming-count').removeClass('new light-blue darken-3');
  }
}
