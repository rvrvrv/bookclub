/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, FB, localStorage, Materialize, progress, tradeRequest */


//Update Trade request button and collapsible
function tradeReqUI(link, requested) {
    let title = $(link).data('title');
    let bookId = $(link).data('book');
    let owner = $(link).data('owner');
    let modalLink = `#modal-${$(link).data('modal')}`;
    
    if (requested) {
        //Update link in book modal
        $(link).html('Cancel Request');
        $(link).attr('data-tooltip', 'Cancel trade request');
        $(link).attr('onclick', 'reqTrade(this)');
        $(link).removeClass('waves-green').addClass('waves-orange');
        //Create link in outgoing requests collapsible
        $('#outgoingCount').html(+$('#outgoingCount').html() + 1);
        $('#outgoingList').append(`
            <a class="collection-item blue-text tooltipped" data-book="${bookId}" 
            data-owner="${owner}" data-tooltip="View ${title} and/or cancel request"
            onclick="$('${modalLink}').modal('open');">${title}</a>`);
        
    } else {
        $(link).html('Request Trade');
        $(link).attr('data-tooltip', `Request ${title}`);
        $(link).attr('onclick', 'reqTrade(this, true)');
        $(link).removeClass('waves-orange').addClass('waves-green');
        //Delete link in outgoing requests collapsible
        $('#outgoingCount').html(+$('#outgoingCount').html() - 1);
        $(`.collection-item[data-book="${bookId}"][data-owner="${owner}"]`).remove();
    }
    $('.tooltipped').tooltip();
}

//Handle 'Request Trade' / 'Cancel Request' link click
function reqTrade(link, interested) {
    
    //Store book trade information
    let tradeRequest = {
        book: $(link).data('book'),
        owner: $(link).data('owner'),
        user: localStorage.getItem('rv-bookclub-id'),
        title: $(link).data('title')
    };

    //First, ensure the user isn't requesting their own book
    if (tradeRequest.owner == tradeRequest.user)
        return Materialize.toast('This is your book!', 3000, 'error');

    //If the trade request is valid, update UI
    $(link).addClass('disabled');
    progress('show');

    //Make the appropriate API call
    let method = interested ? 'POST' : 'DELETE';

    ajaxFunctions.ajaxRequest(method, `/api/trade/${JSON.stringify(tradeRequest)}`, (res) => {
        //After DB changes are complete, update UI
        if (interested) {
            Materialize.toast('Trade requested!', 4000);
            tradeReqUI(link, true);
        }
        else {
            Materialize.toast('Trade request cancelled!', 4000);
            tradeReqUI(link);
        }
        $(link).removeClass('disabled');
        progress('hide');
        tradeRequest = {};
        setTimeout(() => $('.modal').modal('close'), 800);
    });

}
