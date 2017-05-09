/*jshint browser: true, esversion: 6*/
/* global $, FB, generateLoggedInUI localStorage, checkAll */

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
    FB.getLoginStatus(res => statusChangeCallback(res));
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
        
        //Load or create new user in DB
		$.post('/api/user/' + user.id, currentUser)
			.done((res) => {
			    console.log('Created!');
			    console.log(res);
			    //Update UI with logged-in view
                generateLoggedInUI(user, fullName);
			})
			.fail(() => {
			    console.error('Could not load data');
			});

    });
}

//Remove stored ID and redirect to homepage
function loggedOut() {
    localStorage.removeItem('rv-bookclub-id');
    window.location = 'https://rv-bookclub-rvrvrv.c9users.io/';
}


