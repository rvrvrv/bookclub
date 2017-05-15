'use strict';

const books = require('google-books-search');

function search(reqBook, res) {
    books.search(reqBook, (err, results) => {
        if (err) return console.error(err);

        //Extract and format pertinent information from each result
        let formatted = [];
        results.forEach((e,i) => {
            
          //If necessary, replace blank book image with placeholder
              let imgUrl = (!e.thumbnail) 
                 ? '/public/img/blank.jpg' 
                 //Always ensure HTTPS in link
                 : e.thumbnail.replace(/^http:\/\//i, 'https://'); 

          //If necessary, handle empty authors array
          let authors = (!e.authors)
             ? '(No authors listed)'
             //Always display multiple authors cleanly
             : e.authors.join(', ');
             
         //If necessary, handle empty description
          let description = (!e.description)
             ? '(No description available)'
             //Always trim the description
             : e.description.slice(0, 150) + '...';
             
            //Output information to formatted array
            formatted[i] = {
                title: e.title,
                authors: authors,
                thumbnail: imgUrl,
                description: description,
                link: e.link,
                id: e.id
            };
        });
        res.json(formatted);
    });
}        

module.exports = search;
