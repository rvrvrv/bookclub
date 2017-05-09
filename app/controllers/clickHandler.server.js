'use strict';

var Users = require('../models/users.js');

function ClickHandler() {

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
			.exec(function(err, result) {
				if (err) throw err;
				res.json(result);
			});
	};
		

	//Get books in user's collection
	this.getCollection = function(reqUser, res) {
		Users
			.findOne({
				'id': reqUser
			}, {
				'_id': 0,
				'__v': 0
			})
			.exec(function(err, result) {
				if (err) throw err;
				res.json(result);
			});
	};

	//Add book to user's collection
	this.addBook = function(reqUser, reqBook, res) {
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
			.exec(function(err, result) {
				if (err) throw err;
				res.json({
					id: result.id,
					book: result.books,
					action: 'added'
				});
			});
	};

	//Remove book from user's collection
	this.removeBook = function(reqUser, reqBook, res) {
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
			.exec(function(err, result) {
				if (err) throw err;
				res.json({
					id: result.id,
					book: result.books,
					action: 'removed'
				});
			});
	};

}


module.exports = ClickHandler;
