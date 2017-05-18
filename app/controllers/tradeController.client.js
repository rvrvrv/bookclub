/*jshint browser: true, esversion: 6*/
/* global $, ajaxFunctions, FB, localStorage, Materialize, progress, tradeRequest */

//Update 'Request Trade' button
function reqTradeBtnUI(link, requested) {
    if (requested) {
        $(link).html('Cancel Request');
        $(link).attr('data-tooltip', 'Cancel trade request');
        $(link).attr('onclick', 'reqTrade(this)');
        $(link).removeClass('waves-green').addClass('waves-orange');
    } else {
        $(link).html('Request Trade');
        $(link).attr('data-tooltip', `Request ${$(link).data('title')}`);
        $(link).attr('onclick', 'reqTrade(this, true)');
        $(link).removeClass('waves-orange').addClass('waves-green');
    }
    $('.tooltipped').tooltip();
}

//Handle 'Request Trade' / 'Cancel Request' link click
function reqTrade(link, interested) {

    //Store book trade information
    let tradeRequest = {
        book: $(link).data('book'),
        owner: $(link).data('owner'),
        user: localStorage.getItem('rv-bookclub-id')
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
            reqTradeBtnUI(link, true);
        }
        else {
            Materialize.toast('Trade request cancelled!', 4000);
            reqTradeBtnUI(link);
        }
        $(link).removeClass('disabled');
        progress('hide');
        tradeRequest = {};
        setTimeout(() => $('.modal').modal('close'), 1000);
    });

}
