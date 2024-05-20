
const { sendResponse } = require('../../services/common.service')
const constants = require('../../config/constants');
const Temple = require('../../models/temple.model');
const Guru = require('../../models/guru.model');
const Booking = require('../../models/Booking.model')
const {
    checkAdmin
} = require("../../v1/services/user.service");
const { BASEURL, JWT_SECRET, MUXURL, MUX_TOKEN_ID, MUX_TOKEN_SECRET } = require('../../keys/development.keys')
const { templeSave } = require('../services/temple.service')
const dateFormat = require("../../helper/dateformat.helper");
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { TempleReponse } = require('../../ResponseData/Temple.reponse')
const User = require('../../models/user.model');
const axios = require('axios');
const Bank = require('../../models/bankDetails.model')





exports.SearchAllTemples = async (req, res, next) => {

    try {

        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user || ![constants.USER_TYPE.ADMIN, constants.USER_TYPE.USER].includes(user.user_type))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const { sort, state, templename, location, district, is_verify } = req.query;

        let query = {};

        if (templename) {
            const templeRegex = new RegExp(templename.split(' ').join('|'), 'i');
            query.temple_name = templeRegex;
        }
        if (state) {
            const stateRegex = new RegExp(state.split(' ').join('|'), 'i');
            query.state = stateRegex;
        }
        if (is_verify) {
            query.is_verify = is_verify;
        }
        if (location) {
            const locationRegex = new RegExp(location.split(' ').join('|'), 'i');
            query.location = locationRegex;
        }
        if (district) {
            const districtRegex = new RegExp(district.split(' ').join('|'), 'i');
            query.district = districtRegex;
        }

        const sortOptions = {};

        if (sort) {
            const [field, order] = sort.split(':');
            sortOptions[field] = order === 'desc' ? -1 : 1;
        }

        let temples;
        let countTemples;

        if (Object.keys(query).length === 0) {
            temples = await Temple.find({ user_type: 3 })
                .select('temple_name temple_image _id state district location mobile_number email contact_person_name contact_person_designation enable is_verify')
                .sort(sortOptions)
            countTemples = await Temple.countDocuments({ user_type: 3 });
        } else {
            temples = await Temple.find({ user_type: 3, ...query })
                .select('temple_name temple_image _id state district location mobile_number email contact_person_name contact_person_designation enable is_verify')
                .sort(sortOptions)
            countTemples = await Temple.countDocuments({ user_type: 3, ...query });
        }

        const responseData = temples.map(data => ({
            totalTemples: countTemples,
            temple_id: data._id,
            temple_name: data.temple_name,
            temple_image_url: data.temple_image,
            mobile_number: data.mobile_number,
            email: data.email,
            is_verify:data.is_verify,
            user_type: data.user_type,
            location: data.location,
            enable: data.enable,
            description: data.description,
            country: data.country,
            state: data.state,
            district: data.district,
            contact_person_name: data.contact_person_name,
            contact_person_designation: data.contact_person_designation,

        })) || []

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_all_temples', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(SearchAllTemples)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.templeAccountVerify = async (req, res) => {

    try {

        const { temple_id } = req.query;
        const userId = req.user._id;
        const user = await checkAdmin(userId);

        if (user.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const templeData = await Temple.findOneAndUpdate({ _id: temple_id }, { $set: { is_verify: true } }, { new: true });

        if (!templeData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.not_found', {}, req.headers.lang);

        const responseData = {
            temple_id: templeData._id,
            temple_name: templeData.temple_name,
            temple_image_url: templeData.temple_image,
            mobile_number: templeData.mobile_number,
            description: templeData.description,
            country: templeData.country,
            email: templeData.email,
            user_type: templeData.user_type,
            is_verify: templeData.is_verify,
            location: templeData.location,
            state: templeData.state,
            district: templeData.district,
            contact_person_name: templeData.contact_person_name,
            contact_person_designation: templeData.contact_person_designation,
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.account_verify', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(templeAccountVerify)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }

}




exports.templeDelete = async (req, res) => {


    try {

        const { temple_id } = req.query;
        const userId = req.user._id;

        const user = await checkAdmin(userId);
        if (user.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const templeData = await Temple.findOneAndDelete({ _id: temple_id });

        if (!templeData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.not_found', {}, req.headers.lang);


        const responseData = {
            temple_id: templeData._id,
            temple_name: templeData.temple_name,
            mobile_number: templeData.mobile_number,
            email: templeData.email,
            user_type: templeData.user_type,
            is_verify: templeData.is_verify,
            location: templeData.location,
            description: templeData.description,
            country: templeData.country,
            state: templeData.state,
            district: templeData.district,
            contact_person_name: templeData.contact_person_name,
            contact_person_designation: templeData.contact_person_designation,

        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.delete_temples', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(templeDelete)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }

}


exports.deleteBankDetails = async (req, res) => {

    try {

        const userId = req.user._id;
        const { bankId } = req.params;
        const user = await User.findById(userId);

        if (!user || user.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const banks = await Bank.findOneAndDelete({ _id: bankId });

        if (!banks)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.bank_details_not_found', {}, req.headers.lang);

        let data = {
            bank_id: banks._id,
            bank_name: banks.bank_name,
            bank_logo: banks.bank_logo
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.delete_bank_details', data, req.headers.lang);

    } catch (err) {
        console.error('Error(deleteBankDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.templeEnable = async (req, res) => {

    try {

        const userId = req.user._id;
        const { templeId  } = req.params;
        const user = await User.findById(userId);

        const { status } = req.body;

        if (!user || user.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const templeData = await Temple.findOneAndUpdate({ _id: templeId }, { $set: { enable: status } }, { new: true });

        if (!templeData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.not_found', {}, req.headers.lang);

        const responseData = {
            temple_id: templeData._id,
            temple_name: templeData.temple_name,
            mobile_number: templeData.mobile_number,
            email: templeData.email,
            user_type: templeData.user_type,
            is_verify: templeData.is_verify,
            location: templeData.location,
            description: templeData.description,
            enable: templeData.enable,
            country: templeData.country,
            state: templeData.state,
            district: templeData.district,
            contact_person_name: templeData.contact_person_name,
            contact_person_designation: templeData.contact_person_designation,
        } || {};


        if (templeData.enable === true) {
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.temple_enable', responseData, req.headers.lang);
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.temple_disable', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(templeEnable)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}


exports.universalList = async (req, res) => {

    try {

        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user || user.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const totalTemples = await Temple.countDocuments();
        const totalUsers = await User.countDocuments({ user_type: 2 });
        const totalMale = await User.countDocuments({ gender: "male" });
        const totalFemale = await User.countDocuments({ gender: "female" });
        const totalothers = await User.countDocuments({ gender: "others" });
        const totalGurus = await Guru.countDocuments();
        const totalBookings = await Booking.countDocuments();

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);

        const recentUsers = await User.countDocuments({
            created_at: { $gte: oneWeekAgo }
        }).sort({ created_at: -1 });

        const usersLastHour = await User.countDocuments({
            created_at: { $gte: oneHourAgo }
        }).sort({ created_at: -1 });

        const responseData = {
            totalTemples: totalTemples || 0,
            totalUsers: totalUsers || 0,
            totalMale: totalMale || 0,
            totalFemale: totalFemale || 0,
            totalothers: totalothers || 0,
            totalBookings: totalBookings || 0,
            totalGurus: totalGurus || 0,
            activeUsers: recentUsers || 0,
            recentUsers: usersLastHour || 0
            
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.temple_disable', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(universalList)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}

exports.topTemples = async (req, res, next) => {

    try {

        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user || ![constants.USER_TYPE.ADMIN, constants.USER_TYPE.USER].includes(user.user_type)) {
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);
        }

        const templeBookingsCount = {};
        const bookingData = await Booking.find().populate("templeId") 

        bookingData.forEach(booking => {  
            const templeName = booking.templeId.temple_name;
            if (templeBookingsCount[templeName]) {
                templeBookingsCount[templeName]++;
            } else {
                templeBookingsCount[templeName] = 1;
            }
        });

        const sortedTemples = Object.entries(templeBookingsCount)
            .map(([templeName, count]) => ({ templeName, count }))
            .sort((a, b) => b.count - a.count);

        const top10Temples = sortedTemples.slice(0, 10);

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.top_temples', top10Temples, req.headers.lang);

    } catch (err) {
        console.log("err(topTemples)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};
