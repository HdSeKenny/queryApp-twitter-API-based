'use strict';

var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: '1350',
  database: 'query'
});

// Connect to mysql database
connection.connect(function(err) {
  if (!err) {
    console.log(" ✔ MySQL Database is connected ...");
  } else {
    console.log(" ✘ Error connecting database ... " + err);
  }
});

//exports connection
exports.getConnection = function() {
  return connection;
};
