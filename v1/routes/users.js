const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/authenticate');
const { create_new_user_validator, login_validator, ValidatorResult, verify_otp_validator, update_validator,
  upload_profile_image_validator, device_token_validator, new_token_validator } = require('../../validation/user.validator')
const upload = require('../../middleware/multer')
const {
  login,
  logout,
  getUser, verifyOtp, updateProfile, updateDeviceToken, generate_refresh_tokens, signUp,
  updateProfileImage
} = require('../controllers/user.controller');




router.post('/signUp', create_new_user_validator, ValidatorResult, signUp)
router.post('/login', login_validator, ValidatorResult, login)
router.get('/logout', authenticate, logout);
router.get('/otpverify/:userId', verify_otp_validator, ValidatorResult, verifyOtp);
router.get('/getProfile', authenticate, getUser);
router.put('/updateProfile/:userId', update_validator, ValidatorResult, updateProfile)
router.post('/updateDeviceToken', device_token_validator, ValidatorResult, authenticate, updateDeviceToken);
router.post('/generated_new_Tokens', new_token_validator, ValidatorResult, generate_refresh_tokens)
router.post('/updateUserProfileImage', upload.single('profile_image'), authenticate, updateProfileImage)




module.exports = router;
