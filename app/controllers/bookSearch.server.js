'use strict';var books=require('google-books-search');function search(a,b){books.search(a,function(a,c){if(a)return console.error(a);var d=[];return c.forEach(function(a,b){var c=a.thumbnail?a.thumbnail.replace(/^http:\/\//i,'https://'):'/public/img/blank.jpg',e=a.authors?a.authors.join(', '):'(No authors listed)',f=a.description?a.description.slice(0,150)+'...':'(No description available)';d[b]={title:a.title,authors:e,thumbnail:c,description:f,link:a.link,id:a.id}}),b.json(d)})}module.exports=search;