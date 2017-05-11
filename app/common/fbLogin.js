/*jshint browser: true, esversion: 6*/
/* global $, FB, generateLoggedInUI localStorage, checkAll */

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
function statusChangeCallback(response, initial) {
    if (response.status === 'connected') loggedIn();
    else loggedOut(initial);
}

//Called after Login button is clicked
function checkLoginState(initial) {
    FB.getLoginStatus(res => statusChangeCallback(res, initial));
}


//Show logged-in view and save new user to DB
function loggedIn() {
    FB.api('/me?fields=first_name, last_name, picture, hometown, location', function(user) {
        console.log(user);
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
			})
			.fail(() => {
			    console.error('Could not load data');
			});

    });
}

//Remove stored ID and redirect to homepage
function loggedOut(initial) {
    if (initial) return;
    localStorage.removeItem('rv-bookclub-id');
    window.location = 'https://rv-bookclub-rvrvrv.c9users.io/';
}


