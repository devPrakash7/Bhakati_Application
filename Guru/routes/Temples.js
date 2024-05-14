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
    uploadTempleImage , webHooks,
    masterBankList,
    temple_suggested_videos_by_admin} = require('../controller/Temple.controller');
const router = express.Router();
const TempleAuth = require('../../middleware/temple.auth');
const authenticate = require('../../middleware/authenticate')
const upload = require('../../middleware/multer');
const { signup_validator, ValidatorResult, temple_login_validator, get_profile_temple_validator, update_temple_profile_validator, create_live_streaming_validator,
    create_bank_by_admin_validator,
    get_all_bank_list_validator,
    add_bank_validator,
    get_bank_details_validator,
    update_bank_details_validator,
    add_pandit_validator,
    get_pandit_validator,
    update_pandit_details_validator, 
    get_all_live_streaming_validator} = require('../../validation/temple.validator');




router.post('/signUp', signup_validator, ValidatorResult, signUp);
router.post('/uploadTempleImage/:templeId', upload.fields([{ name: 'profile_image', maxCount: 1 }, { name: 'background_image', maxCount: 1 }]), uploadTempleImage)
router.post('/login', temple_login_validator, ValidatorResult, templeLogin);
router.get('/logout', TempleAuth, logout);
router.get('/getTempleProfile', TempleAuth, getTempleProfile);
router.post('/createLiveStreamingByTemple', create_live_streaming_validator, ValidatorResult, TempleAuth, CreateNewLiveStreamByTemple);
router.get('/getTempleLiveStream', getTempleLiveStream);
router.post('/addBankDetails', add_bank_validator, ValidatorResult, TempleAuth, addBankDetails)
router.get('/getBankDetails/:bankId', get_bank_details_validator, ValidatorResult, TempleAuth, getBankDetails)
router.put('/updateBankDetails/:bankId', update_bank_details_validator, ValidatorResult, TempleAuth, updateBankDetails);
router.delete('/deleteBankDetails/:bankId', get_bank_details_validator, ValidatorResult, TempleAuth, deleteBankDetails)
router.post('/addPanditDetails', add_pandit_validator, ValidatorResult, TempleAuth, addpanditDetails)
router.get('/getpanditDetails/:panditId', get_pandit_validator, ValidatorResult, TempleAuth, getpanditDetails);
router.get('/getAllpanditList', TempleAuth, getAllpanditList)
router.put('/updatepanditDetails/:panditId', update_pandit_details_validator, ValidatorResult, TempleAuth, UpdatepanditDetails);
router.delete('/deletePanditDetails/:panditId', get_pandit_validator, ValidatorResult, TempleAuth, deletePanditDetails)
router.post('/generatedNewToken', generate_refresh_tokens);
router.get('/templeSuggestedVideos', TempleAuth, temple_suggested_videos);
router.post('/getTempleProfileByAdmin', get_profile_temple_validator, ValidatorResult, authenticate, getTempleProfileByAdmin);
router.put('/updateTempleProfile', update_temple_profile_validator, ValidatorResult, TempleAuth, updateTempleProfile)
router.post('/addBankDetailsByAdmin', upload.single('logo'), authenticate, addBankDetailsByAdmin);
router.get('/BankList', authenticate , AllBankList);
router.get('/masterBankList', TempleAuth , masterBankList);
router.get("/templeSuggestVideosbyAdmin" , authenticate , temple_suggested_videos_by_admin)






module.exports = router;


