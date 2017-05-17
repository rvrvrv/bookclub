'use strict';

const path = process.cwd();
const ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
const bookSearch = require(path + '/app/controllers/bookSearch.server.js');

module.exports = (app) => {

	let clickHandler = new ClickHandler();
	
	//Homepage
	app.route('/')
		.get((req, res) => {
			res.sendFile(path + '/public/index.html');
		});
		
	app.route('/addbook.html')
		.get((req, res) => {
			res.sendFile(path + '/public/addbook.html');
		});
	
	//Display all books in collection
	app.route('/api/allBooks/')
		.get((req, res) => clickHandler.showAllBooks(req, res));
	
	//User creation and profile update
	app.route('/api/user/:id/:name?/:location?')
		.post((req, res) => clickHandler.createUser(req, res))
		.put((req, res) => clickHandler.updateUser(req.params.id, req.params.name, req.params.location, res));	

	//Add & remove book routes
	app.route('/api/book/:bookId/:userId?')
		.post((req, res) => clickHandler.updateCollection(req, res))
		.get((req, res) => clickHandler.checkAttendees(req.params.bookId, req.params.userId, res))
		.put((req, res) => clickHandler.addBook(req.params.bookId, req.params.userId, res))
		.delete((req, res) => clickHandler.delBook(req.params.bookId, req.params.userId, res));
	
	//Trade request routes
	app.route('/api/trade/:obj')
		.post((req, res) => clickHandler.makeTradeRequest(req.params.obj, res))
		.delete((req, res) => clickHandler.cancelTradeRequest(req.params.obj, res));
	
	//Search via Google Books API
	app.route('/api/search/:book')
		.get((req, res) => { 
			bookSearch(req.params.book, res);
		});
};
