
const { sendResponse } = require('../../services/common.service')
const constants = require("../../config/constants");
const dateFormat = require('../../helper/dateformat.helper');
const Temple = require('../../models/temple.model');
const Rituals = require('../../models/Rituals.model')
const User = require('../../models/user.model')







exports.addNewRithuals = async (req, res) => {

    try {

        const reqBody = req.body;
        const templeId = req.temple._id;

        const temples = await Temple.findOne({ _id: templeId })

        if (!temples || (temples.user_type !== constants.USER_TYPE.TEMPLE))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();
        reqBody.templeId = templeId;
        const newRithuals = await Rituals.create(reqBody);

        const responseData = {
            rithual_id: newRithuals._id,
            ritual_name: newRithuals.ritual_name,
            start_time: newRithuals.start_time,
            end_time: newRithuals.end_time,
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'RITHUAL.add_new_rithuals', responseData, req.headers.lang);

    } catch (err) {
        console.log('err(addNewRithuals).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.getAllRithuals = async (req, res) => {

    try {

        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user || ![constants.USER_TYPE.USER, constants.USER_TYPE.ADMIN].includes(user.user_type))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const { page = 1, limit = 10, sortField = 'rithual_name', sortOrder = 'asc' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        if (parseInt(page) < 1 || parseInt(limit) < 1) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'PUJA.Invalid_page', {}, req.headers.lang);
        }

        const sortOptions = {};
        sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

        const rithuals = await Rituals.find()
            .populate('templeId', 'temple_name temple_image _id')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const totalRithuals = await Rituals.countDocuments();

        if (!rithuals || rithuals.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'RITHUAL.not_found', [], req.headers.lang);

        const responseData = rithuals.map(data => ({
            totalRithuals: totalRithuals,
            rithual_id: data._id,
            ritual_name: data.ritual_name,
            start_time: data.start_time,
            end_time: data.end_time,
        })) || [];

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'RITHUAL.get_all_rithuals', responseData, req.headers.lang);


    } catch (err) {
        console.error('Error(getAllRithuals)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.getRithualsByTemples = async (req, res) => {

    try {

        const templeId = req.temple._id;
        const temples = await Temple.findById(templeId);

        if (!temples || (temples.user_type !== constants.USER_TYPE.TEMPLE))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const { page = 1, limit = 10, sortField = 'rithual_name', sortOrder = 'asc' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        if (parseInt(page) < 1 || parseInt(limit) < 1) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'PUJA.Invalid_page', {}, req.headers.lang);
        }

        const sortOptions = {};
        sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

        const rithuals = await Rituals.find({ templeId: templeId })
            .populate('templeId', 'temple_name temple_image _id')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const totalRithuals = await Rituals.countDocuments({ templeId: templeId });

        if (!rithuals || rithuals.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'RITHUAL.not_found', [], req.headers.lang);

        const responseData = rithuals.map(data => ({
            totalRithuals: totalRithuals,
            rithual_id: data._id,
            ritual_name: data.ritual_name,
            start_time: data.start_time,
            end_time: data.end_time,
            temple_id: data.templeId
        })) || {};

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'RITHUAL.temple_under_all_the_rithuals', responseData, req.headers.lang);


    } catch (err) {
        console.error('Error(getRithualsByTemples)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};


exports.updateRithuals = async (req, res) => {

    try {

        const { rithualId } = req.params
        const reqBody = req.body;
        const { ritual_name , start_time , end_time } = reqBody;
        const templeId  = req.temple._id;
        const temples = await Temple.findOne({ _id: templeId })

        if (!temples || (temples.user_type !== constants.USER_TYPE.TEMPLE))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const newRithuals = await Rituals.findOne({ _id: rithualId, templeId: templeId });

        if (!newRithuals)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'RITHUAL.not_found', {}, req.headers.lang);

        if(ritual_name)
            newRithuals.ritual_name = ritual_name

        if(start_time)
            newRithuals.start_time = start_time;

        if(end_time)
            newRithuals.end_time = end_time;

        await newRithuals.save();

        const responseData = {
            rithual_id: newRithuals._id,
            ritual_name: newRithuals.ritual_name,
            start_time: newRithuals.start_time,
            end_time: newRithuals.end_time,
            temple_id: newRithuals.templeId
        } || {};

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'RITHUAL.update_rithual', responseData, req.headers.lang);

    } catch (err) {
        console.log('err(updateRithuals).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.deleteRithuals = async (req, res) => {

    try {

        const { rithualId } = req.params
        const templeId  = req.temple._id;
        const temples = await Temple.findById(templeId)

        if (!temples || (temples.user_type !== constants.USER_TYPE.TEMPLE))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const newRithuals = await Rituals.findOneAndDelete({ _id: rithualId, templeId: templeId })

        if (!newRithuals)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'RITHUAL.not_found', {}, req.headers.lang);

        const responseData = {
            rithual_id: newRithuals._id,
            ritual_name: newRithuals.ritual_name,
            start_time: newRithuals.start_time,
            end_time: newRithuals.end_time,
            temple_id: newRithuals.templeId
        } || {};

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'RITHUAL.delete_rithuals', responseData, req.headers.lang);

    } catch (err) {
        console.log('err(deleteRithuals).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}