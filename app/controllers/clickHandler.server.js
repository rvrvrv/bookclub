'use strict';

const Users = require('../models/users.js');
const Books = require('../models/books.js');

function ClickHandler() {

	//Retrieve all books in DB
	this.showAllBooks = function(req, res) {
		Books
			.find({}, {
				'_id': 0
			})
			.exec((err, result) => {
				if (err) throw err;
				res.json(result);
			});
	};
	
	//Update collection with new book
	this.updateCollection = function(req, res) {
		let newBook = new Books(req.body);
			newBook
				.save()
				.then(res.json(newBook));
	};

	//Create user (or load existing user)
	this.createUser = function(req, res) {
		Users
			.findOne({
				'id': req.body.id
			}, {
				'_id': 0,
				'__v': 0
			})
			.exec((err, result) => {
				if (err) throw err;
				//If user exists, return data
				if (result) return res.json(result);
				//Otherwise, create new user with FB login data
				let newUser = new Users(req.body);
				newUser
					.save()
					.then(res.json(newUser));
			});
	};

	//Update user profile
	this.updateUser = function(reqId, reqName, reqLocation, res) {
		Users
			.findOneAndUpdate({
				'id': reqId
			}, {
				$set: {
					'name': reqName.trim(),
					'location': reqLocation.trim()
				},
			}, {
				projection: {'name': 1, 'location': 1, '_id': 0},
				new: true
			})
			.exec((err, result) => {
				if (err) throw err;
				res.json(result);
			});
	};
		

	//Get books and trade requests in user's collection
	this.getCollection = function(reqUser, res) {
		Users
			.findOne({
				'id': reqUser
			}, {
				'_id': 0,
				'__v': 0
			})
			.exec((err, result) => {
				if (err) throw err;
				res.json(result);
			});
	};

	//Add book to user's collection
	this.addBook = function(reqBook, reqUser, res) {
		Users
			.findOneAndUpdate({
				'id': reqUser
			}, {
				$addToSet: {
					'books': reqBook
				},
			}, {
				upsert: true,
				new: true
			})
			.exec((err, result) => {
				if (err) throw err;
				res.json({
					id: result.id,
					book: result.books,
					action: 'added'
				});
			});
	};

	//Remove book from user's collection
	this.removeBook = function(reqBook, reqUser, res) {
		Users
			.findOneAndUpdate({
				'id': reqUser
			}, {
				$pull: {
					'books': reqBook
				}
			}, {
				new: true
			})
			.exec((err, result) => {
				if (err) throw err;
				res.json({
					id: result.id,
					book: result.books,
					action: 'removed'
				});
			});
	};
	
	//Make trade request to book owner
	this.makeTradeRequest = function(reqObj, res) {
		let tradeReq = JSON.parse(reqObj);
		//First, submit the request to the book owner
		Users
			.findOneAndUpdate({
				'id': tradeReq.owner
			}, {
				$addToSet: {
					'incomingRequests': {
						bookId: tradeReq.book,
						userId: tradeReq.user
					}
				},
			})
			//Then, update the requester's list of outgoing requests
			.exec((err, result) => {
				if (err) throw err;
				Users
					.findOneAndUpdate({
						'id': tradeReq.user
					}, {
						$addToSet: {
							'outgoingRequests': {
								bookId: tradeReq.book,
								userId: tradeReq.owner
							}
						},
					}, {
						upsert: true
					})
					.exec((err, result) => {
						if (err) throw err;
						console.log(result);
						res.send('Requested!');
					});
			});
	};
	
	//Cancel trade request
	this.cancelTradeRequest = function(reqObj, res) {
		let tradeReq = JSON.parse(reqObj);
		//First, cancel the request to the book owner
		Users
			.findOneAndUpdate({
				'id': tradeReq.owner
			}, {
				$addToSet: {
					'incomingRequests': {
						bookId: tradeReq.book,
						userId: tradeReq.user
					}
				},
			})
			//Then, update the requester's list of outgoing requests
			.exec((err, result) => {
				if (err) throw err;
				Users
					.findOneAndUpdate({
						'id': tradeReq.user
					}, {
						$addToSet: {
							'outgoingRequests': {
								bookId: tradeReq.book,
								userId: tradeReq.owner
							}
						},
					}, {
						upsert: true
					})
					.exec((err, result) => {
						if (err) throw err;
						console.log(result);
						res.send('Cancelled!');
					});
			});
	};
}

module.exports = ClickHandler;
