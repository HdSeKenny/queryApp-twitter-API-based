/**
 * GET     /tweets                  ->  index
 * PUT    /tweets                   ->  create
 * GET    /tweets/:tweetId          ->  show
 * Created by Yao on 05/16.
 */

'use strict';

var sqldb = require('../../config/mysql');
var Connection = sqldb.getConnection();

// Get all tweets in the mysql database
exports.index = function(req, res) {
   Connection.query('SELECT * FROM tweets', function(err, rows) {
      if (err) throw err;
      return res.json(rows)
   })
}

// Create a single tweet into mysql database
exports.create = function(req, res) {
   Connection.query('INSERT IGNORE INTO tweets SET ?', req, function(err, result) {
      if (err) throw err;
      console.log("tweet create success!");
   })
}


// Get single tweet by tweet id
exports.show = function(req, res) {
   Connection.query('SELECT * FROM tweets WHERE tweet_id = ?', req.params.tweetId,
      function(err, rows) {
         if (err) throw err;
         return res.json(rows)
      })
};