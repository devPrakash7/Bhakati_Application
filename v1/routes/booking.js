
const express = require('express');
const {  getAllBookingSlot, createdNewSlot, bookingSlotDownloaded, BookingRithuals} = require('../controllers/booking.controller');
const router = express.Router();
const authenticate = require('../../middleware/authenticate');
const { verifyAccessToken } = require('../../middleware/admin.middleware')


router.post('/createNewSlots' , verifyAccessToken , createdNewSlot)
router.post('/BookingRithuals' , authenticate , BookingRithuals)
router.get('/getAllBookingSlot' , authenticate  , getAllBookingSlot)
router.get('/bookingSlotDownload/:bookingId' , bookingSlotDownloaded)

module.exports = router;