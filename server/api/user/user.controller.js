/**
 * GET     /users                  ->  index
 * PUT    /users                   ->  create
 * GET    /users/:userId        ->  show
 * Created by Yao on 05/16.
 */

'use strict';

var sqldb = require('../../config/mysql');
var Connection = sqldb.getConnection();

// Get all users in the mysql database
exports.index = function(req, res) {
   Connection.query('SELECT * FROM users', function(err, rows) {
      if (err) throw err;
      return res.json(rows)
   })
};

// Create a single user into mysql database
exports.create = function(req, res) {
   Connection.query('INSERT IGNORE INTO users SET ?', req, function(err, result) {
      if (err) throw err;
      console.log("user create success!");
   })

};

// Get single user by user id
exports.show = function(req, res) {

   Connection.query('SELECT * FROM users WHERE user_id = ?', req.params.userId,
      function(err, rows) {
         if (err) throw err;
         return res.json(rows)
      })
};