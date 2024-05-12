
const express = require('express');
const { createdNewSlot, bookingSlotDownloaded, updateSlot, bookedPuja, temple_under_list_of_slots, bookedList, deleteSlot, getAllTheSlots, TempleUnderAllTheBookings, getSlotsWithBookedData } = require('../controllers/booking.controller');
const router = express.Router();
const authenticate = require('../../middleware/authenticate');
const TempleAuth = require('../../middleware/temple.auth');
const { create_new_slot_validator, ValidatorResult, update_slot_validator, delete_slot_validator, new_booking_validator, download_booking_validator } = require('../../validation/booking.validator')




router.post('/createNewSlots', create_new_slot_validator, ValidatorResult, TempleAuth, createdNewSlot)
router.get('/bookingSlotDownload/:booking_id', download_booking_validator, ValidatorResult, authenticate, bookingSlotDownloaded);
router.get('/getAlltheSlots', TempleAuth, getAllTheSlots)
router.put('/updateSlot/:slotId', update_slot_validator, ValidatorResult, TempleAuth, updateSlot);
router.delete('/deleteSlot/:slotId', delete_slot_validator, ValidatorResult, TempleAuth, deleteSlot)
router.post('/bookedPuja', new_booking_validator, ValidatorResult, authenticate, bookedPuja)
router.get('/bookedList', authenticate, bookedList);
router.get('/templeUnderAlltheBookingList', TempleAuth, TempleUnderAllTheBookings)
//router.post('/templeAvailableSlots', TempleAuth, getSlotsWithBookedData)
router.post('/templeAvailableSlots', authenticate, getSlotsWithBookedData)




module.exports = router;