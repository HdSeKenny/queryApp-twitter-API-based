'use strict';

var express = require('express');
var controller = require('./user.controller');
var router = express.Router();

router.get('/', controller.index);
router.get('/:userId', controller.show);
router.put('/', controller.create);

module.exports = router;