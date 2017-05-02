// 'use strict';

// const yelp = require('yelp-fusion');

// function search(reqLocation, res) {
//   let searchRequest = {
//     term: 'nightlife',
//     location: reqLocation
//   };
//   yelp.accessToken(process.env.YELP_APP_ID, process.env.YELP_APP_SECRET).then(response => {
//     const client = yelp.client(response.jsonBody.access_token);
//     client.search(searchRequest).then(response => {
//       res.json(response.jsonBody.businesses);
//     });
//   }).catch(e => console.error(e));
// }

// module.exports = search;
