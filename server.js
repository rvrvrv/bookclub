const express = require('express');
const mongoose = require('mongoose');
const favicon = require('serve-favicon');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('client-sessions');
const routes = require('./app/routes/index.js');

const app = express();
require('dotenv').load();

mongoose.connect(process.env.MONGO_URI, { useMongoClient: true });
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/controllers', express.static(`${process.cwd()}/app/controllers`));
app.use('/public', express.static(`${process.cwd()}/public`));
app.use('/common', express.static(`${process.cwd()}/app/common`));

app.use(session({
  cookieName: 'session',
  secret: process.env.SESS_SECRET,
  duration: 60 * 60 * 1000,
  activeDuration: 30 * 60 * 1000,
  httpOnly: true,
  secure: true,
  ephemeral: true
}));

routes(app);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Node.js listening on port ${port}...`));
