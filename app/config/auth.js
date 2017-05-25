'use strict';

const https = require('https');
const appTokenUrl = `https://graph.facebook.com/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&grant_type=client_credentials`;

module.exports = (auth) => {
    console.log('auth: ', auth);
    //TO DO: parse userToken from auth call
    https.get(appTokenUrl, (response) => {
        response.on('data', (data) => {
            let token = JSON.parse(data);
            //If no app access token, exit function
            if (!token.access_token) return false;
            //If app access token granted, check user's access token
            else {
                let userTokenUrl = `https://graph.facebook.com/debug_token?input_token=${userToken}&access_token=${token.access_token}`;
                https.get(userTokenUrl, (response) => {
                    response.on('data', (newData) => {
                        let result = JSON.parse(newData);
                        console.log('result:', result);
                        if (result.is_valid) return true;
                        else return false;
                    });
                });

            }
        });
    });
}
