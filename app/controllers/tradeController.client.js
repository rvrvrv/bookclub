'use strict';function answerTrade(a,b){progress('show');var c={book:$(a).data('book'),owner:localStorage.getItem('rv-bookclub-id'),user:$(a).data('user')},d=b?'PUT':'DELETE';ajaxFunctions.ajaxRequest(d,'/api/trade/'+JSON.stringify(c),function(){if(b){Materialize.toast('Trade accepted!',4e3),$('#personalList .collection-item[data-book="'+c.book+'"][data-user="'+c.owner+'"]').remove();var d=$('.req-btn[data-book="'+c.book+'"][data-owner="'+c.owner+'"');d.html('Traded!'),d.addClass('disabled')}else Materialize.toast('Trade rejected!',4e3);$(a).remove(),$($(a).children()).tooltip('remove'),$('.collapsible').collapsible('close',0),requestCount('incoming',-1),progress('hide')})}function tradeReqUI(a,b){var c=$(a).data('title'),d=$(a).data('book'),e=$(a).data('owner'),f='#modal-'+$(a).data('modal');b?($(a).html('Cancel Request'),$(a).data('tooltip','Cancel trade request'),$(a).attr('onclick','reqTrade(this)'),$(a).removeClass('waves-green').addClass('waves-orange'),requestCount('outgoing',1),$('#outgoingList').append('\n            <a class="collection-item blue-text tooltipped" data-book="'+d+'" \n            data-owner="'+e+'" data-tooltip="View '+c+' and/or cancel request"\n            onclick="$(\''+f+'\').modal(\'open\');">'+c+'</a>')):($(a).html('Request Trade'),$(a).data('tooltip','Request '+c),$(a).attr('onclick','reqTrade(this, true)'),$(a).removeClass('waves-orange').addClass('waves-green'),requestCount('outgoing',-1),$('.collection-item[data-book="'+d+'"][data-owner="'+e+'"]').remove()),$('.tooltipped').tooltip()}function reqTrade(a,b){var c={book:$(a).data('book'),owner:$(a).data('owner'),user:localStorage.getItem('rv-bookclub-id'),title:$(a).data('title')};if(c.owner==c.user)return Materialize.toast('This is your book!',3e3,'error');$(a).addClass('disabled'),progress('show');var d=b?'POST':'DELETE';ajaxFunctions.ajaxRequest(d,'/api/trade/'+JSON.stringify(c),function(){b?(Materialize.toast('Trade requested!',4e3),tradeReqUI(a,!0)):(Materialize.toast('Trade request cancelled!',4e3),tradeReqUI(a)),$(a).removeClass('disabled'),progress('hide'),setTimeout(function(){return $('.modal').modal('close')},500)})}function requestCount(a,b){var c=+$('#'+a+'Count').html()+b;$('#'+a+'Count').html(c),'incoming'===a&&(0<c&&$('#incomingCount').addClass('new light-blue darken-3'),0===c&&$('#incomingCount').removeClass('new light-blue darken-3'))}