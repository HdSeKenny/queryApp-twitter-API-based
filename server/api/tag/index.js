'use strict';

var express = require('express');
var controller = require('./tag.controller');
var router = express.Router();

router.get('/', controller.index);
router.put('/', controller.create);

module.exports = router;