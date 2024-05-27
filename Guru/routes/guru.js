
const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../../middleware/admin.middleware');
const { addNewGuru, SearchAllGuru, getGuruProfile, GuruCreateNewLiveStream,
    getLiveStreamByGuru, guru_suggested_videos, getGuruProfileByAdmin, guruDelete, updateGuruProfile, Webhook,
    signUp,
    login,
    logout,
    uploadGuruImage,
    guruAccountVerify, 
    GuruBookingAndLiveStreamingReports,
    getUserGuruProfile,
    guru_suggested_videos_user} = require('../controller/guru.controller');
const authenticate = require('../../middleware/authenticate');
const upload = require('../../middleware/multer')
const GuruAuth = require('../../middleware/guru.auth');
const { add_guru_validator, ValidatorResult, get_guru_profile_admin_validator, create_live_validator, guru_suggested_video_validator, login_validator, upload_image_validator, update_guru_validator, get_guru_profile_user_validator } = require('../../validation/guru.validator')






router.post('/signUp', add_guru_validator, ValidatorResult, signUp);
router.post('/login', login_validator, ValidatorResult, login);
router.get('/logout', GuruAuth, logout);
router.post('/uploadImage/:guruId', upload_image_validator, ValidatorResult, upload.fields([{ name: 'profile_image', maxCount: 1 }, { name: 'background_image', maxCount: 1 }]), uploadGuruImage)
router.get('/getProfile', GuruAuth, getGuruProfile);
router.post('/GuruCreatedLiveStream', create_live_validator, ValidatorResult, GuruAuth, GuruCreateNewLiveStream);
router.get('/getGuruLiveStream', getLiveStreamByGuru)
router.get('/SearchAllGuru', authenticate, SearchAllGuru);
router.get('/guruSuggestedVideos', GuruAuth, guru_suggested_videos);
router.post('/getGuruProfileByAdmin', authenticate , getGuruProfileByAdmin);
router.delete('/deleteGuru/:guruId', get_guru_profile_admin_validator, ValidatorResult, verifyAccessToken, guruDelete);
router.get('/getGuruProfileByAdmin/:guruId', get_guru_profile_admin_validator, ValidatorResult, authenticate, getGuruProfileByAdmin);
router.put('/updateGuruProfile', GuruAuth, updateGuruProfile)
router.get('/accountVerify/:guruId', get_guru_profile_admin_validator, ValidatorResult, authenticate, guruAccountVerify);
router.get('/guruReports' , GuruAuth , GuruBookingAndLiveStreamingReports);
router.get('/getProfiles' , get_guru_profile_user_validator , ValidatorResult , authenticate , getUserGuruProfile)
router.get('/guruSuggestedVideo' , get_guru_profile_user_validator , ValidatorResult , authenticate , guru_suggested_videos_user)



module.exports = router;
