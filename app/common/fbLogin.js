/*jshint browser: true, esversion: 6*/
/* global $, FB, generateLoggedInUI, localStorage, location, progress */

window.fbAsyncInit = function() {
    FB.init({
        appId: '703692339810736',
        cookie: true,
        status: true,
        xfbml: true,
        version: 'v2.9'
    });
    checkLoginState(true);
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
    FB.getLoginStatus(res => statusChangeCallback(res));
}


//Show logged-in view and save/load new user in DB
function loggedIn() {
    progress('show');
    FB.api('/me?fields=first_name, last_name, picture, hometown, location', function(user) {

        //Store user's info
        localStorage.setItem('rv-bookclub-id', user.id);
        let userLoc = (!user.location) ? 'Add your location' : user.location.name;
        let currentUser = {
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            location: userLoc
        };

        //Load or create new user in DB
		$.post('/api/user/' + user.id, currentUser)
			.done((res) => {
			    console.log(res);
			    //Update UI with logged-in view
                generateLoggedInUI(res, user.picture.data.url);
                progress('hide');
			})
			.fail(() => {
			    console.error('Could not load data');
			    progress('hide');
			});

    });
}

//Remove stored ID and redirect to homepage (if necessary)
function loggedOut() {
    localStorage.removeItem('rv-bookclub-id');
    currentUser = {};
    //If user isn't logged in, redirect to homepage
    if (location.pathname.length > 1) {
        location.pathname = '/';
    }
}