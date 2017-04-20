/**
 * Main application server
 * Created by Yao on 05/16.
 */

'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var http = require('http');
var express = require("express");
var bodyParser = require('body-parser');

var path = require('path');
var morgan = require('morgan');
var ejs = require('ejs');
var favicon = require('serve-favicon');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var passport = require('passport');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io');
var socket = io.listen(server);


app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cookieParser());
app.use(passport.initialize());

var env = app.get('env');
if (env === 'development') {
   app.use(favicon(__dirname + '/client/assets/images/favicon.ico'));
   app.set('appPath', path.join(__dirname, 'client'));
   app.use(express.static(path.join(path.normalize(__dirname + '/'), 'client')));
   app.use(morgan('dev'));
   app.use(errorhandler());
} else {
   console.log('The current environment is :' + env);
}

require('./server/config/mysql');
require('./server/config/routes')(app);
require('./server/config/twitter')(socket);


server.listen(3000, function() {
   console.log(' * Express server listening on %d, in %s mode', 3000, app.get('env'));
});


exports = module.exports = app;