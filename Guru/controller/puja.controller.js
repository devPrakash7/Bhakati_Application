
const { sendResponse } = require('../../services/common.service')
const Puja = require('../../models/puja.model');
const { BASEURL } = require('../../keys/development.keys')
const constants = require("../../config/constants");
const { checkAdmin } = require('../../v1/services/user.service')
const dateFormat = require('../../helper/dateformat.helper');
const Temple = require('../../models/temple.model');
const User = require('../../models/user.model')
const TemplePuja = require('../../models/temple.puja.model')






exports.addNewPuja = async (req, res) => {

    try {

        const reqBody = req.body;
        const userId = req.user._id;

        const users = await User.findOne({ _id: userId })

        if (!users || (users.user_type !== constants.USER_TYPE.ADMIN))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        if (!req.file)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GURU.upload_image', {}, req.headers.lang);

        const file = req.file
        let pujaImageUrls = `${BASEURL}/uploads/${file.filename}`
        reqBody.puja_image = pujaImageUrls;
        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();

        const newPuja = await Puja.create(reqBody);

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'PUJA.add_new_puja', newPuja, req.headers.lang);

    } catch (err) {
        console.log('err(addNewPuja).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.getAllPuja = async (req, res) => {

    try {

        const userId = req.user._id;
        const users = await User.findOne({ _id: userId })

        if (!users || (users.user_type !== constants.USER_TYPE.ADMIN))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const { page = 1, limit = 10, sortField = 'puja_name', sortOrder = 'asc' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        if (parseInt(page) < 1 || parseInt(limit) < 1)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'PUJA.Invalid_page', {}, req.headers.lang);

        const sortOptions = {};
        sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

        const pujas = await Puja.find().select('puja_image puja_name description category status _id')
            .populate('templeId', 'temple_name temple_image')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const totalPujas = await Puja.countDocuments();

        const responseData = pujas.map(data => ({
            total_pujas: totalPujas,
            puja_name: data.puja_name,
            puja_image_url: data.puja_image,
            description: data.description,
            category: data.category,
            status: data.status,
            puja_id: data._id
        })) || [];

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.get_all_puja', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(getAllPuja)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.ListOfPuja = async (req, res) => {

    try {


        const { page = 1, limit = 10, sortField = 'puja_name', sortOrder = 'asc', status, filter } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        if (parseInt(page) < 1 || parseInt(limit) < 1) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'PUJA.Invalid_page', {}, req.headers.lang);
        }

        const sortOptions = {};
        sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

        const filterCondition = status ? { status } : {};

        if (filter) {
            filterCondition["someField"] = filter;
        }

        const pujas = await Puja.find(filterCondition).select('puja_image puja_name description duration price status')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const totalPujas = await Puja.countDocuments(filterCondition);

        const responseData = pujas.map(data => ({
            total_pujas: totalPujas,
            puja_name: data.puja_name,
            puja_image_url: data.puja_image,
            description: data.description,
            category: data.category,
            status: data.status,
            puja_id: data._id
        })) || [];

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.get_all_puja', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(ListOfPuja)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.addPuja = async (req, res) => {

    try {

        const reqBody = req.body;
        const { puja_id } = reqBody;
        const templeId = req.temple._id;
        const temple = await Temple.findOne({ _id: templeId });

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLE))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();
        reqBody.templeId = templeId;
        reqBody.pujaId = puja_id;
        reqBody.date = dateFormat.current_date()
        const newPujaCreate = await TemplePuja.create(reqBody)

        const data = {
            id: newPujaCreate._id,
            puja_name: newPujaCreate.puja_name,
            duration: newPujaCreate.duration,
            price: newPujaCreate.price,
            temple_id: newPujaCreate.templeId,
            puja_id: newPujaCreate._id,
            created_at: newPujaCreate.created_at,
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.add_new_puja', data, req.headers.lang);

    } catch (err) {
        console.log('err(addPuja).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.pujs_by_temple = async (req, res) => {

    try {

        const { limit } = req.query;
        const templeId = req.temple._id;

        const templeData = await Temple.findById(templeId);

        if (!templeData || (templeData.user_type !== constants.USER_TYPE.TEMPLE))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const pujsList = await TemplePuja.find({ templeId: templeId }).sort({ created_at: -1 }).limit(parseInt(limit));

        const responseData = {
            temple_name: templeData.temple_name || null,
            temple_id: templeData._id || null,
            puja: pujsList.map(puja => ({
                id: puja._id,
                puja_id: puja.pujaId,
                puja_name: puja.puja_name,
                duration: puja.duration,
                cost: puja.price,
                created_at: puja.created_at
            })) || []

        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.temple_under_pujaList', responseData, req.headers.lang);

    } catch (err) {
        console.log('err(pujs_by_temple).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.temple_under_puja_list = async (req, res) => {

    try {

        const { limit } = req.query;
        const { temple_id } = req.params;

        const userId = req.user._id;
        const user = await User.findById(userId)

        if (!user || (user.user_type !== constants.USER_TYPE.USER))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const templeData = await Temple.findById(temple_id);
        const pujsList = await TemplePuja.find({ templeId: temple_id }).sort({ created_at: -1 }).limit(parseInt(limit));

        const responseData = {
            temple_name: templeData.temple_name || null,
            temple_id: templeData._id || null,
            puja: pujsList.map(puja => ({
                id: puja._id,
                puja_id: puja.pujaId,
                puja_name: puja.puja_name,
                duration: puja.duration,
                cost: puja.price,
                created_at: puja.created_at
            })) || []

        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.temple_under_pujaList', responseData, req.headers.lang);

    } catch (err) {
        console.log('err(temple_under_puja_list).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.UpdatePuja = async (req, res) => {

    try {

        const { id } = req.query;
        const { duration, price, puja_name } = req.body;
        const templeId = req.temple._id;

        const temple = await Temple.findOne({ _id: templeId });

        if (!temple || temple.user_type !== constants.USER_TYPE.TEMPLE)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const existingPuja = await TemplePuja.findOne({ _id: id, templeId: templeId });

        if (!existingPuja)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.not_found', {}, req.headers.lang);

        if (duration) existingPuja.duration = duration;
        if (price) existingPuja.price = price;
        if (puja_name) existingPuja.puja_name = puja_name;

        await existingPuja.save();

        const responseData = {
            id: existingPuja._id,
            puja_name: existingPuja.puja_name,
            duration: existingPuja.duration,
            price: existingPuja.price,
            temple_id: existingPuja.templeId,
            puja_id: existingPuja._id,
            created_at: existingPuja.created_at,
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.update_puja', responseData, req.headers.lang);

    } catch (err) {
        console.log('Error(UpdatePuja)...', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.deletePuja = async (req, res) => {

    try {

        const { id } = req.query;
        const templeId = req.temple._id;
        const temple = await Temple.findOne({ _id: templeId });

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLE))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const newpuja = await TemplePuja.findOneAndDelete({ _id: id, templeId: templeId })

        if (!newpuja)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.not_found', {}, req.headers.lang);

        const responseData = {
            id: newpuja._id,
            puja_name: newpuja.puja_name,
            duration: newpuja.duration,
            price: newpuja.price,
            temple_id: newpuja.templeId,
            puja_id: newpuja._id,
            created_at: newpuja.created_at,
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.delete_puja', responseData, req.headers.lang);

    } catch (err) {
        console.log('err(deletePuja).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.deletePujaByAdmin = async (req, res) => {

    try {

        const { puja_id } = req.param;
        const userId = req.user._id;
        const user = await User.findOne({ _id: userId });

        if (!user || (user.user_type !== constants.USER_TYPE.ADMIN))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const newpuja = await Puja.findOneAndDelete({ _id: puja_id });

        if (!newpuja)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.not_found', {}, req.headers.lang);

        const responseData = {
            id: newpuja._id,
            puja_name: newpuja.puja_name,
            duration: newpuja.duration,
            price: newpuja.price,
            temple_id: newpuja.templeId,
            puja_id: newpuja._id,
            created_at: newpuja.created_at,
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'PUJA.delete_puja', responseData, req.headers.lang);

    } catch (err) {
        console.log('err(eletePujaByAdmin).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}