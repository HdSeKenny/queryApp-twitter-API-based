'use strict';

var express = require('express');
var controller = require('./tweet.controller');
var router = express.Router();

router.get('/', controller.index);
router.get('/:tweetId', controller.show);
router.put('/', controller.create);

module.exports = router;