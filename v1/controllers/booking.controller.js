
const { sendResponse } = require("../../services/common.service");
const dateFormat = require("../../helper/dateformat.helper");
const constants = require("../../config/constants");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { v4: uuid } = require('uuid');
const Temple = require("../../models/temple.model");
const moment = require("moment");
const User = require("../../models/user.model");
const Booking = require("../../models/Booking.model");
const Puja = require("../../models/puja.model");
const Slot = require("../../models/slot.model");
const TemplePuja = require("../../models/temple.puja.model");
const { timeToMinutes } = require('../services/booking.service')





exports.createdNewSlot = async (req, res) => {

    try {

        const reqBody = req.body;
        const templeId = req.temple._id;
        const findAdmin = await Temple.findById(templeId);

        if (!findAdmin || findAdmin.user_type !== constants.USER_TYPE.TEMPLE)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);
        const existData = await Slot.findOne({ date: moment(reqBody.date, "DD/MM/YYYY").format("DD/MM/YYYY"), templeId: templeId });

        if (existData)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'BOOKING.slot_already_exist', {}, req.headers.lang);

        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();
        reqBody.templeId = templeId;
        reqBody.slot_duration = reqBody.slot_duration;
        reqBody.date = moment(reqBody.date, "DD/MM/YYYY").format("DD/MM/YYYY");
        const newSlot = await Slot.create(reqBody);
        const slotData = {
            slot_id: newSlot._id,
            start_time: newSlot.start_time,
            end_time: newSlot.end_time,
            slot_duration: newSlot.slot_duration,
            date: newSlot.date,
            temple_id: templeId
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'BOOKING.create_new_slot', slotData, req.headers.lang);

    } catch (err) {
        console.error("Error in createdNewSlot:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};




exports.getAllTheSlots = async (req, res) => {

    try {

        const templeId = req.temple._id;
        const { limit } = req.query;

        const temple = await Temple.findById(templeId);

        if (!temple || temple.user_type !== constants.USER_TYPE.TEMPLE)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const slotList = await Slot.find({ templeId: templeId }).populate("templeId", "temple_name temple_image _id").limit(parseInt(limit)).sort()

        const responseData = slotList.map(data => ({
            //temple_id: data.templeId,
            //temple_name: data.templeId.temple_name,
            //temple_image_url: data.templeId.temple_image,
            temple_id: templeId,
            temple_name: temple.temple_name,
            temple_image_url: temple.temple_image,
            slot_id: data._id,
            start_time: data.start_time,
            end_time: data.end_time,
            slot_duration: data.slot_duration,
            date: data.date,
        })) || []

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.get_all_the_slot', responseData, req.headers.lang);

    } catch (err) {
        console.error("Error in getAllTheSlots:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.updateSlot = async (req, res) => {

    try {

        const reqBody = req.body;
        const templeId = req.temple._id;
        const { slotId } = req.params;

        const findAdmin = await Temple.findById(templeId);

        if (!findAdmin || findAdmin.user_type !== constants.USER_TYPE.TEMPLE)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const updated_at = dateFormat.set_current_timestamp();

        const newSlot = await Slot.findByIdAndUpdate(
            { _id: slotId },
            {
                ...reqBody,
                updated_at
            },
            { new: true }
        );

        const slotData = {
            slot_id: newSlot._id,
            start_time: newSlot.start_time,
            end_time: newSlot.end_time,
            slot_duration: newSlot.slot_duration,
            date: newSlot.date,
            temple_id: templeId
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.update_slots', slotData, req.headers.lang);

    } catch (err) {
        console.error("Error in updateSlot:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.deleteSlot = async (req, res) => {

    try {

        const templeId = req.temple._id;
        const { slotId } = req.params;

        const findAdmin = await Temple.findById(templeId);

        if (!findAdmin || findAdmin.user_type !== constants.USER_TYPE.TEMPLE)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const newSlot = await Slot.findByIdAndDelete(
            { _id: slotId },
        );

        const slotData = {
            slot_id: newSlot._id,
            start_time: newSlot.start_time,
            end_time: newSlot.end_time,
            slot_duration: newSlot.slot_duration,
            date: newSlot.date,
            temple_id: templeId
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.delete_slots', slotData, req.headers.lang);

    } catch (err) {
        console.error("Error in deleteSlot:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.TempleUnderAllTheBookings = async (req, res) => {

    try {

        const templeId = req.temple._id
        const { limit } = req.query;

        const temple = await Temple.findById(templeId);

        if (!temple || temple.user_type !== constants.USER_TYPE.TEMPLE)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const bookings = await Booking.find({ templeId: templeId }).populate("TemplepujaId", 'puja_name duration price')
            .sort()
            .limit(parseInt(limit));

        const responseData = await Promise.all(bookings.map(async (data) => {
            return {
                booking_id: data._id,
                name: data.name,
                email: data.email,
                mobile_number: data.mobile_number,
                available: data.available,
                start_time: data.start_time,
                end_time: data.end_time,
                created_at: data.created_at,
                date: data.date,
                puja_id: data.pujaId,
                puja_name: data.TemplepujaId.puja_name,
                temple_puja_id: data.TemplepujaId._id,
                temple_id: data.templeId
            };
        })) || [];

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.temple_under_booking_list', responseData, req.headers.lang);

    } catch (err) {
        console.error("Error in TempleUnderAllTheBookings:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}



exports.bookedPuja = async (req, res) => {

    try {

        const reqBody = req.body;
        const { temple_id, start_time, end_time, date, email, name, mobile_number, temple_puja_id, slot_id } = reqBody;
        const userId = req.user._id;

        const findAdmin = await User.findById(userId);

        if (!findAdmin || findAdmin.user_type !== constants.USER_TYPE.USER)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const pujaData = await TemplePuja.findOne({ _id: temple_puja_id, templeId: temple_id }).populate("templeId");

        if (!pujaData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.puja_not_available', {}, req.headers.lang);

        const slotData = await Slot.findOne({ _id: slot_id, templeId: temple_id }).populate("templeId")

        if (!slotData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.slots_not_found', {}, req.headers.lang);

        // Convert start and end times to minutes
        const startMinutes = timeToMinutes(start_time);
        const endMinutes = timeToMinutes(end_time);

        // Calculate the duration in minutes
        const duration = endMinutes - startMinutes;

        const bookingData = {
            templeId: temple_id,
            TemplepujaId: temple_puja_id,
            userId: userId,
            slotId: slot_id,
            email: email,
            mobile_number: mobile_number,
            name: name,
            is_reserved: true,
            status: "in_progress",
            start_time: start_time,
            end_time: end_time,
            date: moment(date).format('DD/MM/YYYY'),
            created_at: dateFormat.set_current_timestamp(),
            updated_at: dateFormat.set_current_timestamp()
        };

        const bookings = await Booking.create(bookingData);

        const responseData = {
            booking_id: bookings._id,
            puja_id: pujaData._id,
            puja_name: pujaData.puja_name,
            temple_puja_id: bookings.TemplepujaId,
            duration: pujaData.duration,
            price: pujaData.price,
            status: pujaData.status,
            description: pujaData.description,
            date: pujaData.date,
            puja_image: pujaData.image,
            temple_id: pujaData.templeId._id,
            temple_name: pujaData.templeId.temple_name,
            email: bookings.email,
            mobile_number: bookings.mobile_number,
            name: bookings.name,
            start_time: bookings.start_time,
            end_time: bookings.end_time,
            date: bookings.date,
            is_reserved: bookings.is_reserved,
            total_booking_duration: duration,
            user_id: userId,
            slot_id: slot_id,
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'BOOKING.update_slots', responseData, req.headers.lang);

    } catch (err) {
        console.error("Error in bookedPuja", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.bookedListBackup = async (req, res) => {

    try {

        const userId = req.user._id;
        const { limit, temple_id, date } = req.query;

        const user = await User.findById(userId);

        if (!user || user.user_type !== constants.USER_TYPE.USER)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const bookings = await Booking.find({ userId: userId }).populate('userId')
            .sort()
            .limit(parseInt(limit));

        const templeData = await TemplePuja.find({ templeId: temple_id, date: date })
            .populate('templeId', "temple_name _id temple_image")
            .select('templeId puja_name duration price _id pujaId date');

        const templeIds = bookings.map(book => book.templeId);

        // Fetch temple info for the templeIds
        const temples = await Temple.find({ _id: { $in: templeIds } });

        const responseData = await Promise.all(bookings.map(async (data) => {
            const temple = temples.find(temple => temple._id.equals(data.templeId));
            const templePujaData = templeData.find(td => td._id.equals(data.TemplepujaId));
            return {
                booking_id: data._id,
                name: data.name,
                email: data.email,
                mobile_number: data.mobile_number,
                available: data.available,
                start_time: data.start_time,
                end_time: data.end_time,
                created_at: data.created_at,
                date: data.date,
                user_name: data.userId.full_name,
                user_email: data.userId.email,
                profile_image_url: data.userId.profileImg,
                user_mobile_number: data.userId.mobile_number,
                user_id: data.userId._id,
                puja: {
                    temple_name: temple.temple_name,
                    temple_id: temple._id,
                    temple_image_url: temple.temple_image,
                    puja_name: templePujaData.puja_name,
                    duration: templePujaData.duration,
                    price: templePujaData.price,
                    date: templePujaData.date,
                    temple_puja_id: data.TemplepujaId,
                    master_puja_id: templePujaData.pujaId
                },
                templeData: templeData
                    .map(data => ({
                        temple_name: data.templeId.temple_name,
                        temple_id: data.templeId._id,
                        temple_image_url: data.templeId.templeId,
                        puja_name: data.puja_name,
                        duration: data.duration,
                        price: data.price,
                        date: data.date,
                        temple_puja_id: data._id,
                        master_puja_id: data.pujaId
                    })) || []
            };
        })) || [];

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.booked_list', responseData, req.headers.lang);

    } catch (err) {
        console.error("Error in bookedList:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}




exports.templeBookedList = async (req, res) => {

    try {

        const temple_id = req.temple._id;
        const { limit, from_date, to_date } = req.query;
        console.log("data....", req.query)

        // Find the admin temple
        const findAdmin = await Temple.findById(temple_id);
        if (!findAdmin || findAdmin.user_type !== constants.USER_TYPE.TEMPLE)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        // Parse the limit and dates
        const parsedLimit = parseInt(limit, 10) || 10;
        const startDate = from_date ? moment(from_date, 'DD/MM/YYYY').toDate() : null;
        const endDate = to_date ? moment(to_date, 'DD/MM/YYYY').toDate() : null;

        // Construct the query for bookings
        let bookingQuery = { templeId: temple_id };
        if (startDate && endDate) {
            bookingQuery.date = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const bookings = await Booking.find(bookingQuery)
            .populate('userId')
            .sort({ date: -1 })
            .limit(parsedLimit);

        let pujaQuery = { templeId: temple_id };
        if (startDate && endDate) {
            pujaQuery.date = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const templePujaData = await TemplePuja.find(pujaQuery)
            .populate('templeId', 'temple_name _id temple_image')
            .select('templeId puja_name duration price _id pujaId date');

        const formatDate = (date) => {
            return moment(date).format('DD/MM/YYYY');
        };

        const responseData = bookings.map(data => {
            const temple = templePujaData.find(tp => tp.templeId._id.equals(data.templeId));
            const puja = templePujaData.find(p => p._id.equals(data.TemplepujaId));
            return {
                booking_id: data._id,
                name: data.name,
                email: data.email,
                mobile_number: data.mobile_number,
                available: data.available,
                start_time: data.start_time,
                end_time: data.end_time,
                created_at: formatDate(data.created_at),
                date: formatDate(data.date),
                user_name: data.userId.full_name,
                user_email: data.userId.email,
                user_mobile_number: data.userId.mobile_number,
                user_id: data.userId._id,
                puja: puja ? {
                    temple_name: puja.templeId.temple_name,
                    temple_id: puja.templeId._id,
                    temple_image_url: puja.templeId.temple_image,
                    puja_name: puja.puja_name,
                    duration: puja.duration,
                    price: puja.price,
                    date: formatDate(puja.date),
                    temple_puja_id: puja._id,
                    master_puja_id: puja.pujaId
                } : null
            };
        });

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.booked_list', responseData, req.headers.lang);

    } catch (err) {
        console.error("Error in templeBookedList:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.userBookedList = async (req, res) => {

    try {

        const userId = req.user._id;
        const { limit, from_date, to_date } = req.query;

        const user = await User.findById(userId);

        if (!user || user.user_type !== constants.USER_TYPE.USER)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const startDate = from_date
        const endDate = to_date;

        let query = { userId: userId };
        if (startDate && endDate) {
            query.date = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const bookings = await Booking.find(query).populate('userId').populate('TemplepujaId').populate('templeId')
            .sort()
            .limit(parseInt(limit));


        const responseData = await Promise.all(bookings.map(async (data) => {
            return {
                booking_id: data._id,
                temple_puja_id: data.TemplepujaId._id,
                temple_id: data.templeId._id,
                temple_name: data.templeId.temple_name,
                puja_name: data.TemplepujaId.puja_name,
                name: data.name,
                email: data.email,
                mobile_number: data.mobile_number,
                available: data.available,
                start_time: data.start_time,
                end_time: data.end_time,
                created_at: data.created_at,
                date: data.date,
                is_live_streaming: data.is_live_streaming,
                is_complete: data.is_complete,
                user_id: data.userId._id,
                profile_image_url: data.userId.profileImg,
                streaming_key: data.streaming_key,
                play_back_id: data.play_back_id,
                live_streaming_id: data.live_streaming_id,
            };
        })) || [];

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.booked_list', responseData, req.headers.lang);

    } catch (err) {
        console.error("Error in bookedList:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}



exports.userBookingListOld = async (req, res) => {

    try {

        const userId = req.user._id;
        const { limit } = req.query;

        const user = await User.findById(userId);
        if (!user || user.user_type !== constants.USER_TYPE.USER)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const bookings = await Booking.find({ userId: userId }).populate("userId").sort().limit(parseInt(limit));

        const responseData = await Promise.all(bookings.map(async (data) => {
            return {
                booking_id: data._id,
                name: data.name,
                email: data.email,
                mobile_number: data.mobile_number,
                available: data.available,
                start_time: data.start_time,
                end_time: data.end_time,
                created_at: data.created_at,
                date: data.date,
                user_name: data.userId.full_name,
                user_email: data.userId.email,
                user_mobile_number: data.userId.mobile_number,
                user_id: data.userId._id
            };

        })) || [];

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.booked_list', responseData, req.headers.lang);

    } catch (err) {
        console.error("Error in bookingList:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}




exports.bookingSlotDownloaded = async (req, res) => {

    try {

        const { booking_id } = req.params;

        const userId = req.user._id
        const user = await User.findById(userId);

        if (!user || user.user_type !== constants.USER_TYPE.USER)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const booking = await Booking.findOne({ _id: booking_id }).populate('templeId')

        if (!booking)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'BOOKING.not_found', {}, req.headers.lang)

        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream('booking.pdf'));

        doc.font('Helvetica-Bold')
            .fontSize(14)
            .text('Booking Details', { align: 'center' })
            .moveDown();

        doc.image('OIP.jpeg', {
            fit: [70, 70],
            align: 'center',
            valign: 'top'
        })
            .moveDown();

        doc.font('Helvetica')
            .fontSize(12)
            .text(`Full Name: ${booking.name}`, { bold: true })
            .text(`Email: ${booking.email}`, { bold: true })
            .text(`Mobile Number: ${booking.mobile_number}`, { bold: true })
            .text(`Temple Name: ${booking.templeId.temple_name}`, { bold: true })
            .text(`Temple Location: ${booking.templeId.location}`, { bold: true })
            .text(`Temple District: ${booking.templeId.district}`, { bold: true })
            .text(`Temple State: ${booking.templeId.state}`, { bold: true })
            .text(`Date: ${booking.date}`, { bold: true })
            .text(`Slot: ${booking.Slot}`, { bold: true })
            .text(`Start Time: ${booking.start_time}`, { bold: true })
            .text(`End Time: ${booking.end_time}`, { bold: true })
            .text(`Reference Number: ${booking.ref_no}`, { bold: true })
            .text(`Created At: ${booking.created_at}`, { bold: true })
            .moveDown();

        doc.end();

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.booking_downlod', {}, req.headers.lang);

    } catch (err) {

        console.log("err(BookingDownloaded)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



// Function to convert time to 24-hour format
//Not in use
const convertTo24HourFormat = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
        hours = '00';
    }
    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
};


function convertTo24Hour(time12Hour) {
    const [time, modifier] = time12Hour.split(' ');

    let [hours, minutes] = time.split(':');

    if (hours === '12') {
        hours = '00';
    }

    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }

    return `${hours}:${minutes}`;
}

//Not in use
function convertTo12Hour(time) {
    console.log('time:', time);
    const [hour, minute] = time.split(':');
    const hourInt = parseInt(hour, 10);
    const period = hourInt >= 12 ? 'PM' : 'AM';
    const hour12 = hourInt === 0 ? 12 : hourInt > 12 ? hourInt - 12 : hourInt;
    return `${hour12}:${minute} ${period}`;
}

const convertToLocalTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const addMinutes = (date, minutes) => {
    console.log('===>> addMinutes to date:', date);
    //return date.setMinutes(date.getMinutes() + minutes);
    let newDate = new Date(date);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    console.log('===>> newDate:', newDate);
    return new Date(newDate);
}

function generateTimeSlots(slotStartTime, slotEndTime, newBookDuration, slotDuration, bookedSlots, bookingDate) {
    const startTime = convertTo24Hour(slotStartTime);
    const endTime = convertTo24Hour(slotEndTime);
    const newBookDurationInMinutes = parseInt(newBookDuration, 10);
    const slotDurationInMinutes = parseInt(slotDuration, 10);

    console.log(`start:${slotStartTime}, end:${slotEndTime}, newBookDuration:${newBookDurationInMinutes}, slotDuration:${slotDurationInMinutes}`);

    console.log('bookingDate:', bookingDate);

    bookingDate = moment(bookingDate, "DD/MM/YYYY").format("YYYY-MM-DD");

    const slotStart = new Date(bookingDate + ' ' + startTime);
    const slotEnd = new Date(bookingDate + ' ' + endTime);

    console.log(`slotStart:${slotStart}, slotEnd:${slotEnd}`);


    const slots = [];

    let currentSlotStart = slotStart; // Initialize current slot start time

    while (currentSlotStart < slotEnd) {
        // Calculate current slot end time
        //let currentSlotEnd = new Date(currentSlotStart.getTime() + slotDurationInMinutes * 60000); 
        let currentSlotEnd = addMinutes(currentSlotStart, slotDurationInMinutes);
        //let currentSlotEnd = currentSlotStart.setMinutes(currentSlotStart.getMinutes() + slotDurationInMinutes); 
        console.log('..........currentSlotStart:', currentSlotStart);
        console.log('..........currentSlotEnd:', currentSlotEnd);

        /**
         * Check if current slot is booked
         * 
         * Compares the start and end times of the current slot with the start and end times of each booked slot. It checks if any of the following conditions are true:
         * The start time of the current slot falls within the start and end time of a booked slot.
         * The end time of the current slot falls within the start and end time of a booked slot.
         * The start time of the current slot is before the start time of a booked slot and the end time of the current slot is after the end time of the booked slot.
         */

        const isBooked = bookedSlots.some(slot => {
            let bookedSlotStartTime = new Date(bookingDate + ' ' + convertTo24Hour(slot.start_time));
            let bookedSlotEndTime = new Date(bookingDate + ' ' + convertTo24Hour(slot.end_time));

            return (currentSlotStart >= bookedSlotStartTime && currentSlotStart < bookedSlotEndTime) ||
                (currentSlotEnd > bookedSlotStartTime && currentSlotEnd <= bookedSlotEndTime) ||
                (currentSlotStart <= bookedSlotStartTime && currentSlotEnd >= bookedSlotEndTime);
        });

        console.log('isBooked:', isBooked);
        //console.log('currentSlotEnd - currentSlotStart:', (currentSlotEnd - currentSlotStart));
        //console.log('newBookDurationInMinutes * 60000:', (newBookDurationInMinutes * 60000));

        // If current slot is not booked and can accommodate event duration, add to available slots
        /*if (!isBooked && (currentSlotEnd - currentSlotStart) >= newBookDurationInMinutes * 60000) {
            //slots.push({ startTime: currentSlotStart, endTime: currentSlotEnd });

            slots.push({
                start_time: currentSlotStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                end_time: currentSlotEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                available: true
            });
        }*/

        // If current slot is not booked, find adjacent free slots until event duration is accommodated
        if (!isBooked) {
            let totalDuration = slotDurationInMinutes;
            let nextSlotStart = currentSlotEnd; // Initialize start time of next slot

            let tempCurrentSlotEnd = currentSlotEnd;
            //console.log(`totalDuration:${totalDuration}, newBookDurationInMinutes:${newBookDurationInMinutes}, nextSlotStart:${convertToLocalTime(nextSlotStart)}, nextSlotStart < slotEnd:${nextSlotStart < slotEnd}`);

            // Loop until event duration is accommodated or until no more adjacent free slots are available
            while (totalDuration < newBookDurationInMinutes && nextSlotStart < slotEnd) {
                // Calculate end time of next slot
                //let nextSlotEnd = new Date(nextSlotStart.getTime() + slotDurationInMinutes * 60000);
                let nextSlotEnd = addMinutes(nextSlotStart, slotDurationInMinutes);
                //console.log('nextSlotStart:', nextSlotStart); 
                //console.log('count, nextSlotEnd:', count, convertToLocalTime(nextSlotEnd));


                // Check if next slot is booked
                const isNextSlotBooked = bookedSlots.some(slot => {
                    let bookedSlotStartTime = new Date(bookingDate + ' ' + convertTo24Hour(slot.start_time));
                    let bookedSlotEndTime = new Date(bookingDate + ' ' + convertTo24Hour(slot.end_time));
                    return (nextSlotStart >= bookedSlotStartTime && nextSlotStart < bookedSlotEndTime) ||
                        (nextSlotEnd > bookedSlotStartTime && nextSlotEnd <= bookedSlotEndTime) ||
                        (nextSlotStart <= bookedSlotStartTime && nextSlotEnd >= bookedSlotEndTime);
                });

                //console.log('isNextSlotBooked:', isNextSlotBooked);
                // If next slot is not booked, include it in available slots
                if (!isNextSlotBooked) {
                    //currentSlotEnd = nextSlotEnd;
                    tempCurrentSlotEnd = nextSlotEnd;
                    totalDuration += slotDurationInMinutes;
                } else {
                    break; // Break loop if next slot is booked
                }

                //console.log('slotEndCaptured, tempCurrentSlotEnd:', slotEndCaptured, convertToLocalTime(tempCurrentSlotEnd));

                nextSlotStart = nextSlotEnd; // Move to start time of next next slot
            }

            // If total duration is sufficient for event, add current slot to available slots
            if (totalDuration >= newBookDurationInMinutes && tempCurrentSlotEnd <= slotEnd) {
                //availableSlots.push({ startTime: currentSlotStart, endTime: currentSlotEnd });
                slots.push({
                    start_time: currentSlotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    end_time: tempCurrentSlotEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    available: true
                });
            }
        }//end: if(!isBooked)

        // Move to next slot start time
        currentSlotStart = currentSlotEnd;

    }

    return slots;
}



exports.getSlotsWithBookedData = async (req, res) => {

    try {

        const reqBody = req.body;
        const { templeId, date, temple_puja_id } = reqBody;
        console.log('templeId:', templeId);

        const findAdmin = await Temple.findById(templeId);

        if (!findAdmin || findAdmin.user_type !== constants.USER_TYPE.TEMPLE)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const bookingDate = moment(date, "DD/MM/YYYY").format("DD/MM/YYYY")
        console.log('bookingDate:', bookingDate);

        const bookings = await Booking.find({ templeId: templeId, date: bookingDate }).populate('templeId')
            .sort()
        //.limit(parseInt(limit));

        const slotData = await Slot.findOne({ templeId: templeId, date: bookingDate }).populate("templeId");
        //.limit(parseInt(limit))
        //.sort();
        console.log('slotData', slotData);

        if (!slotData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.slots_not_found', {}, req.headers.lang);

        const pujaData = await TemplePuja.findOne({ _id: temple_puja_id, templeId: templeId })
            .populate('templeId', "_id temple_name temple_image")

        if (!pujaData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.not_found', {}, req.headers.lang);

        const bookingData = await Promise.all(bookings.map(async (data) => {
            return {
                booking_id: data._id,
                available: data.available,
                start_time: data.start_time,
                end_time: data.end_time,
                date: data.date,
            };
        })) || [];

        const startTime24 = convertTo24Hour(slotData.start_time);
        const endTime24 = convertTo24Hour(slotData.end_time);
        const slotDuration = slotData.slot_duration;
        const pujaDuration = pujaData.duration;
        //const slotsWithBookingData = generateTimeSlots(startTime24, endTime24, slotDuration, pujaDuration, bookingData);
        const slotsWithBookingData = generateTimeSlots(startTime24, endTime24, pujaDuration, slotDuration, bookingData, bookingDate);
        const responseData = {
            temple_id: templeId,
            slot_id: slotData._id,
            slots: slotsWithBookingData
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.get_all_the_slot', responseData, req.headers.lang);

    } catch (err) {
        console.error("Error in getAllTheSlots:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};




exports.allBookingList = async (req, res) => {

    try {

        const userId = req.user._id;
        const user = await User.findById(userId);
        const { limit } = req.query;

        if (!user || user.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const allbookingListData = await Booking.find().limit(parseInt(limit)).sort({ created_at: -1 })
            .populate('userId').populate("TemplepujaId").populate('templeId')

            const responseData = await Promise.all(allbookingListData.map(async (data) => {
                const slotData = await Slot.findById(data.slotId);
                return {
                    full_name: data.userId.full_name,
                    user_id: data.userId._id,
                    puja_name: data.TemplepujaId.puja_name,
                    temple_puja_id: data.TemplepujaId.temple_puja_id,
                    temple_name: data.templeId.temple_name,
                    state: data.templeId.state,
                    location: data.templeId.location,
                    district: data.templeId.district,
                    slot_id: data.slotId,
                    name: data.name,
                    slot_date: slotData.date,
                    slot_duration:slotData.slot_duration,
                    date_or_time: data.created_at,
                    email: data.email,
                    mobile_number: data.mobile_number,
                    is_reserved: data.is_reserved,
                    start_time: slotData.start_time, 
                    end_time: slotData.end_time 
                };
            })) || [];
            

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.booking_list', responseData, req.headers.lang);

    } catch (err) {
        console.error("Error in allBookingList:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}