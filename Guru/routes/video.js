const express = require('express');
const router = express.Router();
const { videoAddByTemple, getAllVideo, getVideo, getCountTotalViews, videoAddByGuru } = require('../controller/videoUpload.controller');
const upload = require('../../middleware/multer');
const TempleAuth = require('../../middleware/temple.auth');
const GuruAuth = require('../../middleware/guru.auth');
const { add_new_video_validator, ValidatorResult } = require('../../validation/video.validator');
const authenticate = require('../../middleware/authenticate')



router.post('/addByTempleVideo',upload.single('video'), add_new_video_validator, ValidatorResult, TempleAuth, videoAddByTemple);
router.post('/addByGuruVideo',upload.single('video'), add_new_video_validator, ValidatorResult, GuruAuth, videoAddByGuru);
router.get('/getAllVideos', authenticate ,  getAllVideo);
router.get('/totalViews', getCountTotalViews)



module.exports = router;