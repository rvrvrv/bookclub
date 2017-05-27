'use strict';

const path = process.cwd();
const ClickHandler = require(path + '/app/controllers/clickHandler.server');
const bookSearch = require(path + '/app/controllers/bookSearch.server');
const auth = require(path + '/app/config/auth');
module.exports = (app) => {

	let clickHandler = new ClickHandler();

	//Server-side authentication
	function verifyLogin(req, res, next) {
		if (true) return next();
		//if (auth(req)) return next();
		else res.redirect('/logout');
	}

	//Homepage
	app.route('/')
		.get((req, res) => {
			res.sendFile(path + '/public/index.html');
		});
	
	//Logout route
	app.route('/logout')
		.get((req, res) => {
			req.session.reset();
			res.redirect('/');
		});

	//'Add a Book' page
	app.route('/addbook.html')
		.get((req, res) => {
			if (!req.session.user) return res.redirect('/');
			res.sendFile(path + '/public/addbook.html');
		});

	//Display all books in collection
	app.route('/api/allBooks/')
		.get((req, res) => clickHandler.showAllBooks(req, res));

	//Login / user creation and profile update routes
	app.route('/api/user/:name?/:location?')
		.post(verifyLogin, (req, res) => clickHandler.createUser(req, res))
		.put((req, res) => clickHandler.updateUser(req.session.user, req.params.name, req.params.location, res));

	//Add & remove book routes
	app.route('/api/book/:bookId/:userId?')
		.post((req, res) => clickHandler.addToCollection(req, res))
		.put((req, res) => clickHandler.addBook(req.params.bookId, req.params.userId, res))
		.delete((req, res) => clickHandler.delBook(req.params.bookId, req.params.userId, res));

	//Trade request routes
	app.route('/api/trade/:obj')
		.post((req, res) => clickHandler.makeTradeRequest(req.params.obj, res))
		.put((req, res) => clickHandler.acceptTrade(req.params.obj, res))
		.delete((req, res) => clickHandler.cancelTradeRequest(req.params.obj, res));

	//Search via Google Books API
	app.route('/api/search/:book')
		.get((req, res) => {
			bookSearch(req.params.book, res);
		});
};
