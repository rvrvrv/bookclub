const Users = require('../models/users.js');
const Books = require('../models/books.js');

function ClickHandler() {
  // Retrieve all books in club's collection
  this.showAllBooks = function (req, res) {
    Books
      .find({}, {
        _id: 0
      })
      .exec((err, result) => {
        if (err) throw err;
        res.json(result);
      });
  };

  // Add book to club's collection
  this.addToCollection = function (req, res) {
    Books
      .findOne({
        id: req.body.id,
        owner: req.body.owner
      }, {
        _id: 0,
      })
      .exec((err, result) => {
        if (err) throw err;
        // If book exists, notify user
        if (result) return res.send('exists');
        // Otherwise, add book to database
        const newBook = new Books(req.body);
        return newBook
          .save()
          .then(res.json(newBook));
      });
  };

  // Delete book from club's collection
  this.delFromCollection = function (reqBook, reqOwner, res) {
    Books
      .remove({
        id: reqBook,
        owner: reqOwner
      })
    // Then, find and delete any related trade requests
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
              incomingRequests: {
                bookId: reqBook
              },
              outgoingRequests: {
                bookId: reqBook
              }
            }
          })
          .exec((removeErr, result2) => {
            if (removeErr) throw err;
            res.send('Done!');
          });
      });
  };
  //* *CALLED UPON EVERY LOGIN
  // Create user (or load existing user)
  this.createUser = function (req, res) {
    Users
      .findOne({
        id: req.body.id
      }, {
        _id: 0,
        __v: 0,
        'incomingRequests._id': 0,
        'outgoingRequests._id': 0
      })
      .exec((err, result) => {
        if (err) throw err;
        // Set session cookie
        req.session.user = req.body.id;
        // If user exists, return data
        if (result) {
          return res.json(result);
        }
        // Otherwise, create new user with FB login data
        const newUser = new Users({
          id: req.body.id,
          name: req.body.name,
          location: req.body.location
        });
        return newUser
          .save()
          .then(res.json(newUser));
      });
  };

  // Update user profile
  this.updateUser = function (reqId, reqName, reqLocation, res) {
    Users
      .findOneAndUpdate({
        id: reqId
      }, {
        $set: {
          name: reqName.trim(),
          location: reqLocation.trim()
        },
      }, {
        projection: {
          name: 1,
          location: 1,
          _id: 0
        },
        new: true
      })
      .exec((err, result) => {
        if (err) throw err;
        res.json(result);
      });
  };

  // Add book to user's collection
  this.addBook = function (reqBook, reqUser, res, trade) {
    Users
      .findOneAndUpdate({
        id: reqUser
      }, {
        $addToSet: {
          books: reqBook
        },
      }, {
        projection: {
          _id: 0,
          __v: 0,
          'incomingRequests._id': 0,
          'outgoingRequests._id': 0,
        },
        new: true
      })
      .exec((err, result) => {
        if (err) throw err;
        if (!trade) res.json(result);
      });
  };

  // Remove book from user's collection and club collection, if necessary
  this.delBook = function (reqBook, reqUser, res, trade) {
    Users
      .findOneAndUpdate({
        id: reqUser
      }, {
        $pull: {
          books: reqBook
        }
      }, {
        projection: {
          _id: 0,
          __v: 0,
          'incomingRequests._id': 0,
          'outgoingRequests._id': 0,
        },
        new: true
      })
      .exec((err, result) => {
        if (err) throw err;
        // If this isn't a trade, remove book from the club's collection
        if (!trade) this.delFromCollection(reqBook, reqUser, res);
      });
  };

  // Make trade request to book owner
  this.makeTradeRequest = function (requester, reqObj, res) {
    const tradeReq = JSON.parse(reqObj);

    // First, submit the request to the book owner
    Users
      .findOneAndUpdate({
        id: tradeReq.owner
      }, {
        $addToSet: {
          incomingRequests: {
            bookId: tradeReq.book,
            userId: requester,
            title: tradeReq.title
          }
        }
      }, {
        projection: {
          _id: 0,
          __v: 0,
          'incomingRequests._id': 0,
          'outgoingRequests._id': 0
        },
        new: true
      })
    // Then, update the requester's list of outgoing requests
      .exec((err, result) => {
        if (err) throw err;
        Users
          .findOneAndUpdate({
            id: requester
          }, {
            $addToSet: {
              outgoingRequests: {
                bookId: tradeReq.book,
                userId: tradeReq.owner,
                title: tradeReq.title
              }
            },
          }, {
            projection: {
              _id: 0,
              __v: 0,
              'incomingRequests._id': 0,
              'outgoingRequests._id': 0
            },
            new: true
          })
          .exec((tradeErr, tradeResult) => {
            if (tradeErr) throw err;
            res.json(tradeResult);
          });
      });
  };

  // Cancel trade request
  this.cancelTradeRequest = function (canceller, reqObj, res, trade) {
    const tradeReq = JSON.parse(reqObj);

    /* For security, check whether trade request is being cancelled by
    book owner (rejecting trade) or another user (cancelling request). */

    if (tradeReq.title) tradeReq.user = canceller;
    else tradeReq.owner = canceller;

    /* ^^This is determined by the existence of tradeReq.title. If it exists,
    the trade was cancelled by the requester. Otherwise, the trade was
    rejected by the book owner. The canceller param is req.session.user,
    so this check prevents rogue API calls. */

    // First, cancel the request to the book owner
    Users
      .findOneAndUpdate({
        id: tradeReq.owner
      }, {
        $pull: {
          incomingRequests: {
            bookId: tradeReq.book,
            userId: tradeReq.user
          }
        }
      }, {
        projection: {
          _id: 0,
          __v: 0,
          'incomingRequests._id': 0,
          'outgoingRequests._id': 0
        },
        new: true
      })
    // Then, update the requester's list of outgoing requests
      .exec((err, result) => {
        if (err) throw err;
        Users
          .findOneAndUpdate({
            id: tradeReq.user
          }, {
            $pull: {
              outgoingRequests: {
                bookId: tradeReq.book,
                userId: tradeReq.owner
              }
            }
          }, {
            projection: {
              _id: 0,
              __v: 0,
              'incomingRequests._id': 0,
              'outgoingRequests._id': 0
            },
            new: true
          })
          .exec((cancelErr, cancelResult) => {
            if (cancelErr) throw err;
            if (!trade) res.json(cancelResult);
          });
      });
  };

  // Accept a trade
  this.acceptTrade = function (bookOwner, reqObj, res) {
    const tradeReq = JSON.parse(reqObj);

    // First, swap the book between users
    this.addBook(tradeReq.book, tradeReq.user, res, true);
    this.delBook(tradeReq.book, bookOwner, res, true);
    this.cancelTradeRequest(bookOwner, reqObj, res, true);

    // Then, change the book owner
    Books
      .findOneAndUpdate({
        id: tradeReq.book
      }, {
        $set: {
          owner: tradeReq.user
        },
      }, {
        projection: {
          _id: 0
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
