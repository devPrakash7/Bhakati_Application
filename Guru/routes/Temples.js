const express = require('express');
const { templeLogin, logout, getTempleProfile,
    addBankDetails, getBankDetails, updateBankDetails, addpanditDetails, getpanditDetails, UpdatepanditDetails,
    CreateNewLiveStreamByTemple, getTempleLiveStream, generate_refresh_tokens, temple_suggested_videos, getTempleProfileByAdmin,
    deleteBankDetails, deletePanditDetails,
    getAllpanditList,
    updateTempleProfile,
    addBankDetailsByAdmin,
    AllBankList, updateProfileImage,
    signUp,
    uploadTempleImage } = require('../controller/Temple.controller');
const router = express.Router();
const TempleAuth = require('../../middleware/guru.auth');
const authenticate = require('../../middleware/authenticate')
const upload = require('../../middleware/multer');
const { signup_validator, ValidatorResult, temple_upload_image_validator,
    temple_login_validator, get_profile_temple_validator, update_temple_profile_validator, create_live_streaming_validator } = require('../../validation/temple.validator')




router.post('/signUp', signup_validator, ValidatorResult, signUp);
router.post('/uploadTempleImage/:templeId', temple_upload_image_validator, upload.fields([{ name: 'temple_image', maxCount: 1 }]), uploadTempleImage)
router.post('/login', temple_login_validator, ValidatorResult, templeLogin);
router.get('/logout', TempleAuth, logout);
router.get('/getTempleProfile', TempleAuth, getTempleProfile);
router.post('/createLiveStreamingByTemple', create_live_streaming_validator, ValidatorResult, TempleAuth, CreateNewLiveStreamByTemple);
router.get('/getTempleLiveStream', getTempleLiveStream)
router.post('/addBankDetails', TempleAuth, addBankDetails)
router.get('/getBankDetails/:templeId', getBankDetails)
router.put('/updateBankDetails/:templeId', updateBankDetails);
router.delete('/deleteBankDetails/:templeId', deleteBankDetails)
router.post('/addPanditDetails', TempleAuth, addpanditDetails)
router.get('/getpanditDetails/:panditId', TempleAuth, getpanditDetails);
router.get('/getAllpanditList/:templeId', getAllpanditList)
router.put('/updatepanditDetails/:panditId', TempleAuth, UpdatepanditDetails);
router.delete('/deletePanditDetails/:panditId', TempleAuth, deletePanditDetails)
router.post('/generatedNewToken', generate_refresh_tokens);
router.get('/templeSuggestedVideos', TempleAuth, temple_suggested_videos);
router.post('/getTempleProfileByAdmin', get_profile_temple_validator, ValidatorResult, authenticate, getTempleProfileByAdmin);
router.put('/updateTempleProfile', update_temple_profile_validator, ValidatorResult, TempleAuth, updateTempleProfile)
router.post('/addBankDetailsByAdmin', upload.single('logo'), authenticate, addBankDetailsByAdmin);
router.get('/BankList', AllBankList);
router.post('/updateProfileImage', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'background_image', maxCount: 1 }]), TempleAuth, updateProfileImage);






module.exports = router;


