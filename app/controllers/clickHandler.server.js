'use strict';var Users=require('../models/users.js'),Books=require('../models/books.js');function ClickHandler(){this.showAllBooks=function(a,b){Books.find({},{_id:0}).exec(function(a,c){if(a)throw a;b.json(c)})},this.addToCollection=function(a,b){Books.findOne({id:a.body.id,owner:a.body.owner},{_id:0}).exec(function(c,d){if(c)throw c;if(d)return b.send('exists');var e=new Books(a.body);return e.save().then(b.json(e))})},this.delFromCollection=function(a,b,c){Books.remove({id:a,owner:b}).exec(function(b){if(b)throw b;Users.updateMany({$or:[{"incomingRequests.bookId":a},{"outgoingRequests.bookId":a}]},{$pull:{incomingRequests:{bookId:a},outgoingRequests:{bookId:a}}}).exec(function(a){if(a)throw b;c.send('Done!')})})},this.createUser=function(a,b){Users.findOne({id:a.body.id},{_id:0,__v:0,"incomingRequests._id":0,"outgoingRequests._id":0}).exec(function(c,d){if(c)throw c;if(a.session.user=a.body.id,d)return b.json(d);var e=new Users({id:a.body.id,name:a.body.name,location:a.body.location});return e.save().then(b.json(e))})},this.updateUser=function(a,b,c,d){Users.findOneAndUpdate({id:a},{$set:{name:b.trim(),location:c.trim()}},{projection:{name:1,location:1,_id:0},new:!0}).exec(function(a,b){if(a)throw a;d.json(b)})},this.addBook=function(a,b,c,d){Users.findOneAndUpdate({id:b},{$addToSet:{books:a}},{projection:{_id:0,__v:0,"incomingRequests._id":0,"outgoingRequests._id":0},new:!0}).exec(function(a,b){if(a)throw a;d||c.json(b)})},this.delBook=function(a,b,c,d){var e=this;Users.findOneAndUpdate({id:b},{$pull:{books:a}},{projection:{_id:0,__v:0,"incomingRequests._id":0,"outgoingRequests._id":0},new:!0}).exec(function(f){if(f)throw f;d||e.delFromCollection(a,b,c)})},this.makeTradeRequest=function(a,b,c){var d=JSON.parse(b);Users.findOneAndUpdate({id:d.owner},{$addToSet:{incomingRequests:{bookId:d.book,userId:a,title:d.title}}},{projection:{_id:0,__v:0,"incomingRequests._id":0,"outgoingRequests._id":0},new:!0}).exec(function(b){if(b)throw b;Users.findOneAndUpdate({id:a},{$addToSet:{outgoingRequests:{bookId:d.book,userId:d.owner,title:d.title}}},{projection:{_id:0,__v:0,"incomingRequests._id":0,"outgoingRequests._id":0},new:!0}).exec(function(a,d){if(a)throw b;c.json(d)})})},this.cancelTradeRequest=function(a,b,c,d){var e=JSON.parse(b);e.title?e.user=a:e.owner=a,Users.findOneAndUpdate({id:e.owner},{$pull:{incomingRequests:{bookId:e.book,userId:e.user}}},{projection:{_id:0,__v:0,"incomingRequests._id":0,"outgoingRequests._id":0},new:!0}).exec(function(a){if(a)throw a;Users.findOneAndUpdate({id:e.user},{$pull:{outgoingRequests:{bookId:e.book,userId:e.owner}}},{projection:{_id:0,__v:0,"incomingRequests._id":0,"outgoingRequests._id":0},new:!0}).exec(function(b,e){if(b)throw a;d||c.json(e)})})},this.acceptTrade=function(a,b,c){var d=JSON.parse(b);this.addBook(d.book,d.user,c,!0),this.delBook(d.book,a,c,!0),this.cancelTradeRequest(a,b,c,!0),Books.findOneAndUpdate({id:d.book},{$set:{owner:d.user}},{projection:{_id:0},new:!0}).exec(function(a,b){if(a)throw a;c.json(b)})}}module.exports=ClickHandler;