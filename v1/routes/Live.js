const express = require('express');
const { createNewLiveStream  } = require('../controllers/livestream.controller');
const router = express.Router();
const { create_liveStream_validator, ValidatorResult, } = require('../../validation/liveStream.validator')
const authenticate = require("../../middleware/authenticate")
const TempleAuth = require('../../middleware/temple.auth')


router.post('/createNewLiveStream', TempleAuth, createNewLiveStream);

module.exports = router;