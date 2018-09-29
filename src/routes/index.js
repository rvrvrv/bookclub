const path = process.cwd();
const ClickHandler = require(`${path}/app/controllers/clickHandler.server`);
const bookSearch = require(`${path}/app/controllers/bookSearch.server`);
const auth = require(`${path}/app/config/auth`);

module.exports = (app) => {
  const clickHandler = new ClickHandler();

  // Server-side authentication
  function verifyLogin(req, res, next) {
    auth(req.body.id, req.body.signed)
      .then(() => next())
      .catch(() => res.status(401).send());
  }

  // Homepage
  app.route('/')
    .get((req, res) => {
      res.sendFile(`${path}/public/index.html`);
    });

  // Logout route
  app.route('/logout')
    .get((req, res) => {
      req.session.reset();
      res.redirect('/');
    });

  // 'Add a Book' page
  app.route('/addbook.html')
    .get((req, res) => ((req.session.user) ? res.sendFile(`${path}/public/addbook.html`) : res.redirect('/')));

  // Display all books in collection
  app.route('/api/allBooks/')
    .get((req, res) => clickHandler.showAllBooks(req, res));

  // Login / user creation and profile update routes
  app.route('/api/user/:name?/:location?')
    .post(verifyLogin, (req, res) => clickHandler.createUser(req, res))
    .put((req, res) => clickHandler.updateUser(req.session.user, req.params.name, req.params.location, res));

  // Add & remove book routes
  app.route('/api/book/:bookId/:userId?')
    .post((req, res) => clickHandler.addToCollection(req, res))
    .put((req, res) => clickHandler.addBook(req.params.bookId, req.session.user, res))
    .delete((req, res) => clickHandler.delBook(req.params.bookId, req.session.user, res));

  // Trade request routes
  app.route('/api/trade/:obj')
    .post((req, res) => clickHandler.makeTradeRequest(req.session.user, req.params.obj, res))
    .put((req, res) => clickHandler.acceptTrade(req.session.user, req.params.obj, res))
    .delete((req, res) => clickHandler.cancelTradeRequest(req.session.user, req.params.obj, res));

  // Search via Google Books API
  app.route('/api/search/:book')
    .get((req, res) => {
      bookSearch(req.params.book, res);
    });
};
