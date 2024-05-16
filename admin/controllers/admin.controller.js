
const { sendResponse } = require('../../services/common.service')
const constants = require('../../config/constants');
const User = require('../../models/user.model');
const {
    deleteUserAccount,
    checkAdmin,
    getUser
} = require("../../v1/services/user.service");
const { LoginResponseData, userResponse } = require('../../ResponseData/user.reponse')
const bcrypt = require('bcryptjs')




exports.login = async (req, res) => {

    const { email } = req.body;

    try {

        const user = await User.findOne({ email: email, deleted_at: null })

        if (!user)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.invalid_username_password', {}, req.headers.lang);

        if (user.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        await user.generateAuthToken();
        await user.generateRefreshToken();

        let users = {
            full_name: user.full_name,
            mobile_number: user.mobile_number,
            dob: user.dob,
            gender: user.gender,
            user_type: user.user_type,
            status: user.status,
            token:user.tokens,
            refresh_token:user.refresh_tokens,
            isUpdated: user.isUpdated,
            verify: user.verify,
            signup_status: user.signup_status,
            address: user.address,
            deleted_at: user.deleted_at,
            _id: user._id,
            email: user.email,
            created_at: user.created_at,
            updated_at: user.updated_at
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.login_success', users, req.headers.lang);
    } catch (err) {
        console.log("err(admin_login)........", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.logout = async (req, res) => {

    try {

        const reqBody = req.user;

        let UserData = await User.findById(reqBody._id)
        UserData.tokens = null
        UserData.refresh_tokens = null

        await UserData.save()

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.logout_success', {}, req.headers.lang);

    } catch (err) {
        console.log("err(admin_logout)........", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}




// this api access only admin and integrate this api in the admin panel
exports.getAllUser = async (req, res) => {

    try {

        const userId = req.user._id;
        const findAdmin = await checkAdmin(userId);

        if (findAdmin.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const filter = { user_type: 2 };

        if (req.query.email) {
            filter.email = req.query.email;
        }

        if (req.query.mobileNumber) {
            filter.mobileNumber = req.query.mobileNumber;
        }

        if (req.query.full_name) {
            filter.full_name = req.query.full_name;
        }

        const sortBy = req.query.sortBy || 'created_at';
        const sortOrder = req.query.sortOrder || 1;

        let usersQuery = User.find(filter).sort({ [sortBy]: sortOrder })

        if (!req.query.email && !req.query.mobileNumber && !req.query.full_name) {
            usersQuery = User.find({ user_type: 2 }).sort({ [sortBy]: sortOrder })
        }

        const users = await usersQuery;

        if (!users || users.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'USER.not_found', {}, req.headers.lang);

        const totalUsers = await User.countDocuments({ user_type: 2 });
        const activeUser = await User.countDocuments({ status: 1, user_type: 2 });

        let data = {
            total_users: totalUsers,
            activeUsers: activeUser,
            users: users
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.getAllUser', data, req.headers.lang);

    } catch (err) {
        console.log('err(getAllUser)', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};




exports.getAllAdmin = async (req, res) => {

    try {

        const userId = req.user._id;
        const findAdmin = await checkAdmin(userId);

        if (findAdmin.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const filter = { user_type: 1 };

        if (req.query.email) {
            filter.email = req.query.email;
        }

        if (req.query.mobileNumber) {
            filter.mobileNumber = req.query.mobileNumber;
        }

        if (req.query.full_name) {
            filter.full_name = req.query.full_name;
        }

        const sortBy = req.query.sortBy || 'created_at';
        const sortOrder = req.query.sortOrder || 1;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let usersQuery = User.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit);

        if (!req.query.email && !req.query.mobileNumber && !req.query.full_name) {
            usersQuery = User.find({ user_type: 1 }).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit);
        }

        const users = await usersQuery;

        if (!users || users.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'USER.not_found', {}, req.headers.lang);

        const totalUsers = await User.countDocuments({ user_type: 1 });

        let data = {
            total_users: totalUsers,
            users: users
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.getAllUser', data, req.headers.lang);

    } catch (err) {
        console.log('err(getAllAdmin)', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};


exports.getUser = async (req, res) => {

    try {

        const userId = req.user._id;

        const user = await getUser(userId);

        if (!user)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.user_details_not_found', {}, req.headers.lang);

        if (user.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const responseData = {
            full_name: user.full_name,
            mobile_number: user.mobile_number,
            dob: user.dob,
            gender: user.gender,
            user_type: user.user_type,
            status: user.status,
            isUpdated: user.isUpdated,
            verify: user.verify,
            signup_status: user.signup_status,
            address: user.address,
            deleted_at: user.deleted_at,
            _id: user._id,
            email: user.email,
            created_at: user.created_at,
            updated_at: user.updated_at
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.profile_fetch_success', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error in getUser:', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};


// this api access only admin and integrate this api in the admin panel
exports.deleteProfile = async (req, res) => {

    try {

        const { userId } = req.query
        const userIds = req.user._id;

        const findAdmin = await checkAdmin(userIds);

        if (findAdmin.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const user = await deleteUserAccount(userId)

        if (!user)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.not_found', {}, req.headers.lang);

        let resData = user
        delete resData.reset_password_token;
        delete resData.password;
        delete resData.tokens;
        delete resData.user_type;
        delete resData.status;
        delete resData.signup_status;
        delete resData.refresh_tokens;
        delete resData.tempTokens;

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.delete_account', resData, req.headers.lang);

    } catch (err) {

        console.log('err(deleteProfile).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


