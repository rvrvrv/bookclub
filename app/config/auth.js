'use strict';
const https = require('https');

module.exports = (userId, userAccessToken) => {
    const appTokenUrl = `https://graph.facebook.com/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&grant_type=client_credentials`;
    let userTokenUrl = '';

    //Get app access token from FB, which allows us to verify user access token
    function getAppAccessToken(userAccessToken) {
        https.get(appTokenUrl, (res) => {
            res.on('data', (data) => {
                let token = JSON.parse(data);
                //If no app access token, exit function
                if (!token.access_token) return false;
                //If app access token granted, check user's access token
                userTokenUrl = `https://graph.facebook.com/debug_token?input_token=${userAccessToken}&access_token=${token.access_token}`;
            })
            .on('end', (data) => {
                verifyToken(userTokenUrl);
        });
    });
    }
    
    //Verify user access token, and compare it to original auth call
    function verifyToken(url) {
        https.get(url, (res) => {
            res.on('data', (data) => {
                let user = JSON.parse(data);
                console.log(user);
                if (user.data.is_valid && user.data.user_id === userId) console.log('valid!');
                else console.log('invalid');
            })
            .on('end', (data) => {
                console.log('done');
            });
        });
    }

    getAppAccessToken(userAccessToken);
};
