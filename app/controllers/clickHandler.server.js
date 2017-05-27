'use strict';

const Users = require('../models/users.js');
const Books = require('../models/books.js');

function ClickHandler() {

	//Retrieve all books in club's collection
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

	//Add book to club's collection
	this.addToCollection = function(req, res) {
		Books
			.findOne({
				'id': req.body.id,
				'owner': req.body.owner
			}, {
				'_id': 0,
			})
			.exec((err, result) => {
				if (err) throw err;
				//If book exists, notify user
				if (result) return res.send('exists');
				//Otherwise, add book to database
				let newBook = new Books(req.body);
				newBook
					.save()
					.then(res.json(newBook));
			});
	};

	//Delete book from club's collection
	this.delFromCollection = function(reqBook, reqOwner, res) {
		Books
			.remove({
				'id': reqBook,
				'owner': reqOwner
			})
			//Then, find and delete any related trade requests
			.exec((err, result) => {
				if (err) throw err;
				Users
					.updateMany({
						$or: [{
							'incomingRequests.bookId': reqBook
						}, {
							'outgoingRequests.bookId': reqBook
						}]
					}, {
						$pull: {
							'incomingRequests': {
								'bookId': reqBook
							},
							'outgoingRequests': {
								'bookId': reqBook
							}
						}
					})
					.exec((err, result2) => {
						if (err) throw err;
						res.send('Done!');
					});
			});
	};
	//**CALLED UPON LOGIN
	//Create user (or load existing user)
	this.createUser = function(req, res) {
		Users
			.findOne({
				'id': req.body.id
			}, {
				'_id': 0,
				'__v': 0,
				'incomingRequests._id': 0,
				'outgoingRequests._id': 0
			})
			.exec((err, result) => {
				if (err) throw err;
				//Set session cookie
				console.log(req.session);
				req.session.user = req.body.id;
				console.log(req.session.user);
				//If user exists, set session cookie and return data
				if (result) {
					return res.json(result);
				}
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
				projection: {
					'name': 1,
					'location': 1,
					'_id': 0
				},
				new: true
			})
			.exec((err, result) => {
				if (err) throw err;
				res.json(result);
			});
	};

	//Get user's information, including books and trade requests
	this.getUser = function(reqUser, res) {
		Users
			.findOne({
				'id': reqUser
			}, {
				'_id': 0,
				'__v': 0,
				'incomingRequests._id': 0,
				'outgoingRequests._id': 0
			})
			.exec((err, result) => {
				if (err) throw err;
				res.json(result);
			});
	};

	//Add book to user's collection
	this.addBook = function(reqBook, reqUser, res, trade) {
		Users
			.findOneAndUpdate({
				'id': reqUser
			}, {
				$addToSet: {
					'books': reqBook
				},
			}, {
				projection: {
					'_id': 0,
					'__v': 0,
					'incomingRequests._id': 0,
					'outgoingRequests._id': 0,
				},
				'new': true
			})
			.exec((err, result) => {
				if (err) throw err;
				if (!trade) res.json(result);
			});
	};

	//Remove book from user's collection and club collection, if necessary
	this.delBook = function(reqBook, reqUser, res, trade) {
		Users
			.findOneAndUpdate({
				'id': reqUser
			}, {
				$pull: {
					'books': reqBook
				}
			}, {
				projection: {
					'_id': 0,
					'__v': 0,
					'incomingRequests._id': 0,
					'outgoingRequests._id': 0,
				},
				'new': true
			})
			.exec((err, result) => {
				if (err) throw err;
				//If this isn't a trade, remove book from the club's collection
				if (!trade) this.delFromCollection(reqBook, reqUser, res);
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
						'bookId': tradeReq.book,
						'userId': tradeReq.user,
						'title': tradeReq.title
					}
				}
			}, {
				projection: {
					'_id': 0,
					'__v': 0,
					'incomingRequests._id': 0,
					'outgoingRequests._id': 0
				},
				'new': true
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
								'bookId': tradeReq.book,
								'userId': tradeReq.owner,
								'title': tradeReq.title
							}
						},
					}, {
						projection: {
							'_id': 0,
							'__v': 0,
							'incomingRequests._id': 0,
							'outgoingRequests._id': 0
						},
						'new': true
					})
					.exec((err, result) => {
						if (err) throw err;
						res.json(result);
					});
			});
	};

	//Cancel trade request
	this.cancelTradeRequest = function(reqObj, res, trade) {
		let tradeReq = JSON.parse(reqObj);

		//First, cancel the request to the book owner
		Users
			.findOneAndUpdate({
				'id': tradeReq.owner
			}, {
				$pull: {
					'incomingRequests': {
						'bookId': tradeReq.book,
						'userId': tradeReq.user
					}
				}
			}, {
				projection: {
					'_id': 0,
					'__v': 0,
					'incomingRequests._id': 0,
					'outgoingRequests._id': 0
				},
				'new': true
			})
			//Then, update the requester's list of outgoing requests
			.exec((err, result) => {
				if (err) throw err;
				Users
					.findOneAndUpdate({
						'id': tradeReq.user
					}, {
						$pull: {
							'outgoingRequests': {
								'bookId': tradeReq.book,
								'userId': tradeReq.owner
							}
						}
					}, {
						projection: {
							'_id': 0,
							'__v': 0,
							'incomingRequests._id': 0,
							'outgoingRequests._id': 0
						},
						'new': true
					})
					.exec((err, result) => {
						if (err) throw err;
						if (!trade) res.json(result);
					});
			});
	};

	//Accept a trade
	this.acceptTrade = function(reqObj, res) {
		let tradeReq = JSON.parse(reqObj);

		//First, swap the book between users
		this.addBook(tradeReq.book, tradeReq.user, res, true);
		this.delBook(tradeReq.book, tradeReq.owner, res, true);
		this.cancelTradeRequest(reqObj, res, true);

		//Then, change the book owner
		Books
			.findOneAndUpdate({
				'id': tradeReq.book
			}, {
				$set: {
					'owner': tradeReq.user
				},
			}, {
				projection: {
					'_id': 0
				},
				new: true
			})
			.exec((err, result) => {
				if (err) throw err;
				res.json(result);
			});
	};
}

module.exports = ClickHandler;
