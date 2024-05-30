const express = require('express');
const { addNewPuja, getAllPuja, addPuja, ListOfPuja, pujs_by_temple, deletePuja, deletePujaByAdmin, UpdatePuja, temple_under_puja_list, UpdatePujaByAdmin } = require('../controller/puja.controller');
const router = express.Router();
const TempleAuth = require('../../middleware/temple.auth')
const upload = require('../../middleware/multer');
const authenticate = require('../../middleware/authenticate');
const { add_puja_validator, Validator_Result, puja_add_by_temple_validator, delete_puja_validator, delete_puja_by_admin_validator } = require('../../validation/puja.validator');



router.post('/addNewPuja', upload.single('puja_image'), add_puja_validator, Validator_Result, authenticate, addNewPuja);
router.get('/getAllpuja', authenticate, getAllPuja);
router.post('/addpuja', puja_add_by_temple_validator, Validator_Result, TempleAuth, addPuja);
//router.get('/MasterPuja', TempleAuth, ListOfPuja)
router.get('/MasterPuja', ListOfPuja)
router.get('/TempleUnderAllpujaList', TempleAuth, pujs_by_temple)
router.get('/templeUnderAllpujaList/:temple_id', authenticate, temple_under_puja_list)
router.delete('/deletePuja', delete_puja_validator, Validator_Result, TempleAuth, deletePuja);
router.put('/updatePuja', delete_puja_validator, Validator_Result, TempleAuth, UpdatePuja)
router.delete('/deletePujaByAdmin/:puja_id', delete_puja_by_admin_validator, Validator_Result, authenticate, deletePujaByAdmin)
router.put('/updatePujaByAdmin/:puja_id' , delete_puja_by_admin_validator, Validator_Result, authenticate, UpdatePujaByAdmin)




module.exports = router;