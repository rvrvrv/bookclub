const books = require('google-books-search');

function search(reqBook, res) {
  books.search(reqBook, (err, results) => {
    if (err) return console.error(err);

    // Extract and format pertinent information from each result
    const formatted = [];
    results.forEach((book, i) => {
      // Insert https in URL (if necessary) or replace blank book image with placeholder
      const imgUrl = book.thumbnail
        ? book.thumbnail.replace(/^http:\/\//i, 'https://')
        : '/public/img/blank.jpg';

      // Format multiple authors (if necessary) or handle empty authors
      const authors = book.authors ? book.authors.join(', ') : '(No authors listed)';

      // Trim long descriptions or handle empty descriptions
      const description = (book.description)
        ? `${book.description.slice(0, 150)}...`
        : '(No description available)';

      // Output information to formatted array
      formatted[i] = {
        title: book.title,
        authors,
        thumbnail: imgUrl,
        description,
        link: book.link,
        id: book.id
      };
    });
    return res.json(formatted);
  });
}

module.exports = search;
