/**
 * GET     /tags                  ->  index
 * PUT    /tags                   ->  create
 * Created by Yao on 05/16.
 */

'use strict';

var sqldb = require('../../config/mysql');
var Connection = sqldb.getConnection();

exports.index = function(req, res) {
   Connection.query('SELECT * FROM tags', function(err, rows) {
      if (err) throw err;
      return res.json(rows)
   })
}

exports.create = function(req, res) {
   Connection.query('INSERT INTO tags SET ?', req, function(err, result) {
      if (err) throw err;
      console.log("tag create success!");
   })
}