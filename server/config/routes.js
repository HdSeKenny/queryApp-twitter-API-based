/**
 * Main application routes
 * Created by Kuan & Yao on 05/16.
 */

'use strict';

module.exports = function(app) {

   // Insert routes below
   app.use('/api/tweets', require('../api/tweet'));
   app.use('/api/users', require('../api/user'));
   app.use('/api/tags', require('../api/tag'));

   // All other routes should redirect to the index.html
   app.route('/*')
      .get(function(req, res) {
         res.header('Access-Control-Allow-Origin', 'http://localhost:3000/');
         res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
         res.sendFile(app.get('appPath') + '/index.html');
      });
};