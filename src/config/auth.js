// Verify user's access token via FB servers
module.exports = function (userId, userAccessToken) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    const appTokenUrl = `https://graph.facebook.com/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&grant_type=client_credentials`;
    let userTokenUrl = '';
    let result;
    // First, get app access token from FB
    https.get(appTokenUrl, (res) => {
      res.on('data', (data) => {
        const token = JSON.parse(data);
        // If no app access token, exit function
        if (!token.access_token) reject();
        // If app access token granted, check user's access token
        userTokenUrl = `https://graph.facebook.com/debug_token?input_token=${userAccessToken}&access_token=${token.access_token}`;
      })
        .on('end', () => {
          verifyToken(userTokenUrl);
        });
    });

    // Verify user access token, and compare it to original auth call
    function verifyToken(url) {
      https.get(url, (res) => {
        res.on('data', (data) => {
          const user = JSON.parse(data);
          if (user.data.is_valid && user.data.user_id === userId) {
            result = true;
            resolve();
          }
        })
          .on('end', (data) => {
            if (result) resolve();
            else reject();
          });
      });
    }
  });
};
