'use strict';

const path = process.cwd();
const ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
const bookSearch = require(path + '/app/controllers/bookSearch.server.js');

module.exports = (app) => {

	let clickHandler = new ClickHandler();

	app.route('/')
		.get((req, res) => {
			res.sendFile(path + '/public/index.html');
		});
	
	//Display all books in collection
	app.route('/api/allBooks/')
		.get((req, res) => clickHandler.showAllBooks(req, res));
	
	//User creation and profile update
	app.route('/api/user/:id/:name?/:location?')
		.post((req, res) => clickHandler.createUser(req, res))
		.put((req, res) => clickHandler.updateUser(req.params.id, req.params.name, req.params.location, res));	

	//Attendance routes
	app.route('/api/book/:book/:id?')
		.get((req, res) => clickHandler.checkAttendees(req.params.book, req.params.id, res))
		.put((req, res) => clickHandler.attend(req.params.book, req.params.id, res))
		.delete((req, res) => clickHandler.unAttend(req.params.book, req.params.id, res));
	
	//Search via Google Books API
	app.route('/api/search/:book')
		.get((req, res) => { 
			bookSearch(req.params.book, res);
		});
};
