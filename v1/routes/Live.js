const express = require('express');
const { createNewLiveStream, getAllLiveStreamByPuja } = require('../controllers/livestream.controller');
const router = express.Router();
const { create_liveStream_validator, ValidatorResult, } = require('../../validation/liveStream.validator')
const authenticate = require("../../middleware/authenticate")



router.post('/createNewLiveStream', create_liveStream_validator, ValidatorResult, authenticate, createNewLiveStream);
router.get('/getAllLiveStreamByPuja', authenticate, getAllLiveStreamByPuja);

module.exports = router;