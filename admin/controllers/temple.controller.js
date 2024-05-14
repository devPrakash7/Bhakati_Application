
const { sendResponse } = require('../../services/common.service')
const constants = require('../../config/constants');
const Temple = require('../../models/temple.model');
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






exports.SearchAllTemples = async (req, res, next) => {

    try {

        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user || ![constants.USER_TYPE.ADMIN, constants.USER_TYPE.USER].includes(users.user_type))
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
                .select('temple_name temple_image _id state district location mobile_number email contact_person_name contact_person_designation')
                .sort(sortOptions)
            countTemples = await Temple.countDocuments({ user_type: 3 });
        } else {
            temples = await Temple.find({ user_type: 3, ...query })
                .select('temple_name temple_image _id state district location mobile_number email contact_person_name contact_person_designation')
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
            user_type: data.user_type,
            location: data.location,
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
            temple_image_url: templeData.temple_image,
            mobile_number: templeData.mobile_number,
            email: templeData.email,
            user_type: templeData.user_type,
            is_verify: templeData.is_verify,
            location: templeData.location,
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
