
const express = require('express');
const { addTemple, SearchAllTemples, templeDelete, templeAccountVerify, deleteBankDetails, templeEnable, universalList, topTemples } = require('../controllers/temple.controller');
const router = express.Router()
const upload = require('../../middleware/multer')
const { verifyAccessToken } = require('../../middleware/admin.middleware');
const { delete_temple_validator, ValidatorResult, get_bank_details_validator, temple_enable_validator } = require("../../validation/temple.validator")
const authenticate = require("../../middleware/authenticate")


//router.post('/addTemple', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'background_image', maxCount: 1 }]), verifyAccessToken, addTemple);
router.get('/searchTemples', authenticate, SearchAllTemples);
router.delete('/deleteTemple', delete_temple_validator, ValidatorResult, verifyAccessToken, templeDelete)
router.get('/templeAccountVerify', delete_temple_validator, ValidatorResult, verifyAccessToken, templeAccountVerify)
router.delete('/bankDetailsDeleteByAdmin/:bankId', authenticate, deleteBankDetails)
router.put('/templeEnableOrDisable/:templeId', temple_enable_validator, ValidatorResult, authenticate, templeEnable);
router.get('/unverisalList', authenticate, universalList)
router.get('/topTemples' , authenticate, topTemples)



module.exports = router