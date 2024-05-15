const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../../services/common.service");
const dateFormat = require("../../helper/dateformat.helper");
const User = require("../../models/user.model");
const { isValid } = require("../../services/blackListMail");
const {
    Usersave,
    getUser
} = require("../services/user.service");
const { WEB_STATUS_CODE, STATUS_CODE } = require("../../config/constants");
const { BASEURL } = require("../../keys/keys");
const { sendMail } = require('../../services/email.services')
const { LoginResponse, LoginResponseData, VerifyOtpResponse, userResponse, userProfileImageResponse } = require('../../ResponseData/user.reponse');
const constants = require("../../config/constants");
const { JWT_SECRET } = require('../../keys/development.keys')





exports.signUp = async (req, res, next) => {

    try {

        const reqBody = req.body

        const checkMail = await isValid(reqBody.email)
        if (checkMail == false) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);

        let existingUser = await getUser(reqBody.email, 'email');
        if (existingUser)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.email_already_exist', {}, req.headers.lang);

        reqBody.password = await bcrypt.hash(reqBody.password, 10);
        reqBody.created_at = await dateFormat.set_current_timestamp();
        reqBody.updated_at = await dateFormat.set_current_timestamp();
        reqBody.tempTokens = await jwt.sign({
            data: reqBody.email
        }, JWT_SECRET, {
            expiresIn: constants.URL_EXPIRE_TIME
        })

        reqBody.device_type = (reqBody.device_type) ? reqBody.device_type : null
        reqBody.device_token = (reqBody.device_token) ? reqBody.device_token : null
        const user = await Usersave(reqBody);

        let users = userResponse(user);
        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'USER.signUp_success', users, req.headers.lang);

    } catch (err) {
        console.log("err(SignUp)........", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}




exports.logout = async (req, res) => {

    try {

        const user = req.user;

        const userData = await User.findById(user._id);

        if (userData.user_type !== constants.USER_TYPE.USER)
            return sendResponse(res, WEB_STATUS_CODE.UNAUTHORIZED, STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        userData.tokens = null;
        userData.refresh_tokens = null;

        await userData.save();

        return sendResponse(res, WEB_STATUS_CODE.OK, STATUS_CODE.SUCCESS, 'USER.logout_success', {}, req.headers.lang);

    } catch (err) {
        console.error("Error in logout:", err);
        return sendResponse(res, WEB_STATUS_CODE.SERVER_ERROR, STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};




exports.login = async (req, res) => {

    try {

        const { email } = req.body;
        const checkMail = await isValid(email);

        if (!checkMail)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);

        let user = await User.findOne({ email, user_type: 2 });

        let otp = 123456;
        let text = 123456;

        if (!user) {
            // await sendMail(email, text);
            const newUser = await User.create({ email, otp, created_at: new Date(), updated_at: new Date() });
            const responseData = {
                status: newUser.status,
                signup_status: newUser.signup_status,
                otp: newUser.otp,
                _id: newUser._id,
                email: newUser.email,
                created_at: newUser.created_at,
                updated_at: newUser.updated_at
            };
            return sendResponse(res, WEB_STATUS_CODE.OK, STATUS_CODE.SUCCESS, 'USER.login_success', responseData, req.headers.lang);
        }

        if (user.verify == false) {
            return sendResponse(res, WEB_STATUS_CODE.OK, STATUS_CODE.SUCCESS, 'USER.not_verify', user, req.headers.lang);
        }

        if (user.status === 0) {
            return sendResponse(res, WEB_STATUS_CODE.BAD_REQUEST, STATUS_CODE.FAIL, 'USER.inactive_account', {}, req.headers.lang);
        }
        if (user.status === 2 || user.deleted_at !== null) {
            return sendResponse(res, WEB_STATUS_CODE.BAD_REQUEST, STATUS_CODE.FAIL, 'USER.deactive_account', {}, req.headers.lang);
        }

        //await sendMail(email, text);
        user.otp = text;
        await user.save();

        const newToken = await user.generateAuthToken();
        const refreshToken = await user.generateRefreshToken();
        user.refresh_tokens = refreshToken;
        user.tokens = newToken;
        await user.save();

        const responseData = {
            user_type: user.user_type,
            verify: user.verify,
            status: user.status,
            signup_status: user.signup_status,
            tokens: user.tokens,
            refresh_tokens: user.refresh_tokens,
            otp: user.otp,
            deleted_at: user.deleted_at,
            _id: user._id,
            email: user.email,
            created_at: user.created_at,
            updated_at: user.updated_at
        }

        return sendResponse(res, WEB_STATUS_CODE.OK, STATUS_CODE.SUCCESS, 'USER.login_success', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error in login:', err);
        return sendResponse(res, WEB_STATUS_CODE.SERVER_ERROR, STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.verifyOtp = async (req, res) => {

    try {

        const { userId } = req.params;
        const { otp } = req.body;

        const user = await User.findOne({ _id: userId })

        if (user.otp !== otp)
            return sendResponse(res, WEB_STATUS_CODE.BAD_REQUEST, STATUS_CODE.FAIL, 'USER.otp_not_matched', {}, req.headers.lang);

        if (user.user_type !== constants.USER_TYPE.USER)
            return sendResponse(res, WEB_STATUS_CODE.UNAUTHORIZED, STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const newToken = await user.generateAuthToken();
        const refreshToken = await user.generateRefreshToken();

        const updatedUser = await User.findByIdAndUpdate(userId, {
            otp: null,
            tokens: newToken,
            refresh_tokens: refreshToken,
            verify: true
        }, { new: true });

        const responseData = {
            user_type: updatedUser.user_type,
            verify: updatedUser.verify,
            status: updatedUser.status,
            signup_status: updatedUser.signup_status,
            tokens: updatedUser.tokens,
            refresh_tokens: updatedUser.refresh_tokens,
            deleted_at: updatedUser.deleted_at,
            _id: updatedUser._id,
            email: updatedUser.email,
            created_at: updatedUser.created_at,
            updated_at: updatedUser.updated_at
        }

        return sendResponse(res, WEB_STATUS_CODE.OK, STATUS_CODE.SUCCESS, 'USER.otp_verify', responseData, req.headers.lang);


    } catch (err) {
        console.error('Error in verifyOtp:', err);
        return sendResponse(res, WEB_STATUS_CODE.SERVER_ERROR, STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.getUser = async (req, res) => {

    try {

        const userId = req.user._id;

        const user = await User.findOne({ _id: userId });
        if (!user)
            return sendResponse(res, WEB_STATUS_CODE.BAD_REQUEST, STATUS_CODE.FAIL, 'USER.user_details_not_found', {}, req.headers.lang);

        if (user.user_type !== constants.USER_TYPE.USER && user.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, WEB_STATUS_CODE.UNAUTHORIZED, STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const responseData = {
            full_name: user.full_name,
            mobile_number: user.mobile_number,
            dob: user.dob,
            gender: user.gender,
            user_type: user.user_type,
            status: user.status,
            profile_image_url: user.profileImg,
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

        return sendResponse(res, WEB_STATUS_CODE.OK, STATUS_CODE.SUCCESS, 'USER.profile_fetch_success', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error in getUser:', err);
        return sendResponse(res, WEB_STATUS_CODE.SERVER_ERROR, STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.updateProfile = async (req, res) => {

    try {

        const { userId } = req.params;
        const reqBody = req.body;

        const userData = await User.findById(userId);
        if (!userData)
            return sendResponse(res, WEB_STATUS_CODE.BAD_REQUEST, STATUS_CODE.FAIL, 'USER.not_found', {}, req.headers.lang);

        if (userData.isUpdated === true)
            return sendResponse(res, WEB_STATUS_CODE.OK, STATUS_CODE.SUCCESS, 'USER.already_updated', userData, req.headers.lang);

        if (userData.user_type !== constants.USER_TYPE.USER)
            return sendResponse(res, WEB_STATUS_CODE.UNAUTHORIZED, STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const updated_at = dateFormat.set_current_timestamp();
        const updatedUser = await User.findByIdAndUpdate(userId,
            {
                ...reqBody,
                updated_at
            },
            { new: true }
        );

        if (!updatedUser)
            return sendResponse(res, WEB_STATUS_CODE.BAD_REQUEST, STATUS_CODE.FAIL, 'USER.not_found', {}, req.headers.lang);

        const responseData = {
            full_name: updatedUser.full_name,
            mobile_number: updatedUser.mobile_number,
            dob: updatedUser.dob,
            gender: updatedUser.gender,
            user_type: updatedUser.user_type,
            status: updatedUser.status,
            isUpdated: updatedUser.isUpdated,
            verify: updatedUser.verify,
            address: updatedUser.address,
            profile_image_url: updatedUser.profileImg,
            signup_status: updatedUser.signup_status,
            deleted_at: updatedUser.deleted_at,
            _id: updatedUser._id,
            email: updatedUser.email,
            created_at: updatedUser.created_at,
            updated_at: updatedUser.updated_at
        };

        return sendResponse(res, WEB_STATUS_CODE.OK, STATUS_CODE.SUCCESS, 'USER.profile_update_success', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error in updateProfile:', err);
        return sendResponse(res, WEB_STATUS_CODE.SERVER_ERROR, STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};


exports.updateProfileImage = async (req, res) => {

    try {

        const userId = req.user._id;
        const user = await User.findOne({ _id: userId });

        if (!user || (user.user_type !== constants.USER_TYPE.USER))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        if (!req.file)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.no_image_upload', {}, req.headers.lang);

        let files = req.file;
        const profile_image_url = `${BASEURL}/uploads/${files.filename}`;

        const userData = await User.findOneAndUpdate({ _id: userId }, {
            $set:
            {
                profileImg: profile_image_url,
                updated_at: dateFormat.set_current_timestamp()
            }
        }, { new: true });


        if (!userData)
            return sendResponse(res, WEB_STATUS_CODE.OK, STATUS_CODE.SUCCESS, 'USER.not_found', {}, req.headers.lang);

        const responseData = {
            full_name: userData.full_name,
            mobile_number: userData.mobile_number,
            dob: userData.dob,
            gender: userData.gender,
            address:userData.address,
            user_type: userData.user_type,
            status: userData.status,
            isUpdated: userData.isUpdated,
            verify: userData.verify,
            profile_image_url:userData.profileImg,
            signup_status: userData.signup_status,
            deleted_at: userData.deleted_at,
            _id: userData._id,
            email: userData.email,
            created_at: userData.created_at,
            updated_at: userData.updated_at
        }
    
        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.update_user_profile_image', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(updateProfileImage)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.updateDeviceToken = async (req, res) => {

    try {

        const userId = req.user._id;
        const reqBody = req.body;
        const { device_token, device_type } = reqBody;
        const users = await User.findOne({ _id: userId });

        if (!users)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.user_details_not_found', {}, req.headers.lang);

        users.device_token = device_token;
        users.device_type = device_type;
        users.updated_at = dateFormat.set_current_timestamp()
        await users.save();

        let user =
        {
            device_token: device_token,
            device_type: device_type
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.update_device_token', user, req.headers.lang);

    } catch (err) {

        console.log('err(updateDeviceToken).....', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.generate_refresh_tokens = async (req, res, next) => {

    try {

        let user = await User.findOne({ refresh_tokens: req.body.refresh_tokens });

        if (!user)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.token_expired', {}, req.headers.lang);

        let newToken = await user.generateAuthToken();
        let refresh_token = await user.generateRefreshToken();
        await user.save();

        let data = {
            token: newToken,
            refresh_token: refresh_token
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.get_user_auth_token', data, req.headers.lang);

    } catch (err) {
        console.log('err(generate_refresh_tokens)', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}