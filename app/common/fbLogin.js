/*jshint browser: true, esversion: 6*/
/* global $, FB, generateUI localStorage, checkAll */

window.fbAsyncInit = function() {
    FB.init({
        appId: '703692339810736',
        cookie: true,
        xfbml: true,
        version: 'v2.9'
    });
    FB.AppEvents.logPageView();
};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

//Check for login status change
function statusChangeCallback(response) {
    if (response.status === 'connected') loggedIn();
    else loggedOut();
}

//Called after Login button is clicked
function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}


//Show logged-in view and save new user to DB
function loggedIn() {
    FB.api('/me?fields=first_name, last_name, picture, hometown, location', function(user) {
        //Store user's info
        localStorage.setItem('rv-bookclub-id', user.id);
        let fullName = `${user.first_name} ${user.last_name}`;
        let currentUser = {
            id: user.id,
            name: fullName,
            location: user.location.name || 'Add your location'
        };
        console.log(currentUser);
        
        //Generate dropdown menu and profile modal
        generateUI(user, fullName);

        //TO-DO: Store in DB
        
        $('#loginBtn').hide();
        $('#welcome').hide();
        $('.menu').removeClass('hidden');
        checkAll(); //Update attendance stats for visible locations
    });
}

//Update page with logged-out view
function loggedOut() {
    localStorage.removeItem('rv-bookclub-id');
    $('#userInfo').empty();
    $('#loginBtn').show();
    //checkAll(); //Update attendance stats for visible locations
}

//Log out the user
$('.logout-buttons').click(() => FB.logout(resp => checkLoginState()));
