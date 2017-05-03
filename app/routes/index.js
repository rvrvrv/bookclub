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
	
	//Attendance routes
	app.route('/api/attend/:loc/:id?')
		.get((req, res) => clickHandler.checkAttendees(req.params.loc, req.params.id, res))
		.put((req, res) => clickHandler.attend(req.params.loc, req.params.id, res))
		.delete((req, res) => clickHandler.unAttend(req.params.loc, req.params.id, res));
	
	//Search via Google Books API
	app.route('/api/list/:book')
		.get((req, res) => { 
			bookSearch(req.params.book, res);
		});
};
