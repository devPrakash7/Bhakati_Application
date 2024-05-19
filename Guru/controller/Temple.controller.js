
const { sendResponse } = require('../../services/common.service')
const { BASEURL, MUXURL, MUX_TOKEN_ID, MUX_TOKEN_SECRET, WEBHOOKSCRETKEY } = require('../../keys/development.keys')
const { isValid } = require("../../services/blackListMail");
const constants = require("../../config/constants");
const bcrypt = require('bcryptjs')
const Temple = require('../../models/temple.model');
const dateFormat = require('../../helper/dateformat.helper')
const Bank = require('../../models/bankDetails.model');
const Pandit = require('../../models/pandit.model');
const Puja = require('../../models/puja.model');
const LiveStreaming = require('../../models/live.streaming.model');
const Video = require('../../models/uploadVideo.model');
const axios = require('axios');
const { getData, minutesToSeconds } = require('../services/views.services')
const User = require('../../models/user.model');
const { sendOTP, resendOTP, verifyOTP } = require('../../services/otp.service')
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../keys/development.keys');
const TempleBankDetails = require('../../models/templeBankDetail.model')
const Mux = require('@mux/mux-node');
const mux = new Mux({
    tokenId: MUX_TOKEN_ID,
    tokenSecret: MUX_TOKEN_SECRET,
    webhookSecret: WEBHOOKSCRETKEY,
});
const Booking = require('../../models/Booking.model');




exports.signUp = async (req, res) => {

    const reqBody = req.body;

    try {

        const checkMail = await isValid(reqBody.email)
        if (checkMail == false) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);

        const templesEmailExist = await Temple.findOne({ email: reqBody.email });

        if (templesEmailExist)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'TEMPLE.email_already_exist', {}, req.headers.lang);

        reqBody.password = await bcrypt.hash(reqBody.password, 10)
        reqBody.tempTokens = await jwt.sign({
            email: reqBody.email.toString()
        }, JWT_SECRET, { expiresIn: '24h' })

        reqBody.puja_list = reqBody.puja_list
        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();
        const templeData = await Temple.create(reqBody);

        const responseData = {
            temple_id: templeData._id,
            temple_name: templeData.temple_name,
            mobile_number: templeData.mobile_number,
            email: templeData.email,
            user_type: templeData.user_type,
            country: templeData.country,
            location: templeData.location,
            state: templeData.state,
            district: templeData.district,
            category: templeData.category,
            opening_time: templeData.opening_time,
            closing_time: templeData.closing_time,
            puja_list: templeData.puja_list,
            live_streaming: templeData.live_streaming,
            contact_person_name: templeData.contact_person_name,
            contact_person_designation: templeData.contact_person_designation,
            created_at: templeData.created_at,
            updated_at: templeData.updated_at,
            __v: 0
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'TEMPLE.signUp_success', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(signUp)........", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.uploadTempleImage = async (req, res) => {

    try {

        const { templeId } = req.params;

        const temple = await Temple.findOne({ _id: templeId });

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLE))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);


        if (!req.files || (!req.files['profile_image'] && !req.files['background_image']))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'TEMPLE.no_image', {}, req.headers.lang);


        let temple_image_url;
        let background_image_url;

        if (req.files['profile_image'] && req.files['profile_image'][0]) {
            temple_image_url = `${BASEURL}/uploads/${req.files['profile_image'][0].filename}`;
            temple.temple_image = temple_image_url;
        } else {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'TEMPLE.no_image', {}, req.headers.lang);
        }

        if (req.files['background_image'] && req.files['background_image'][0]) {
            background_image_url = `${BASEURL}/uploads/${req.files['background_image'][0].filename}`;
            temple.background_image = background_image_url;
        } else {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'TEMPLE.no_image', {}, req.headers.lang);
        }

        await temple.save();

        const responseData = {
            temple_id: temple._id,
            temple_name: temple.temple_name,
            temple_image_url: temple.temple_image,
            mobile_number: temple.mobile_number,
            email: temple.email,
            user_type: temple.user_type,
            location: temple.location,
            state: temple.state,
            district: temple.district,
            category: temple.category,
            country: temple.country,
            opening_time: temple.opening_time,
            closing_time: temple.closing_time,
            feature_image_url: temple.background_image,
            contact_person_name: temple.contact_person_name,
            contact_person_designation: temple.contact_person_designation,
            created_at: temple.created_at,
            updated_at: temple.updated_at,
            __v: temple.__v
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.upload_success', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(uploadTempleImage)........:', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.templeLogin = async (req, res) => {

    try {

        const reqBody = req.body;
        const { email, password } = reqBody;

        const temple = await Temple.findOne({ email });

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLE))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const matchPassword = await bcrypt.compare(password, temple.password);
        if (!matchPassword)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.invalid_password', {}, req.headers.lang);

        if (temple)

            if (temple.status === 0 || temple.status === 2 || temple.deleted_at !== null) {
                let errorMsg;
                if (temple.status === 0) errorMsg = 'USER.inactive_account';
                else if (temple.status === 2) errorMsg = 'USER.deactive_account';
                else errorMsg = 'USER.inactive_account';
                return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, errorMsg, {}, req.headers.lang);
            }

        if (temple.enable === false)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, "TEMPLE.temple_disable_by_admin", {}, req.headers.lang);

        if (temple.is_verify === false)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, "TEMPLE.temple_not_verify", {}, req.headers.lang);

        const newToken = await temple.generateAuthToken();
        const refreshToken = await temple.generateRefreshToken();

        temple.refresh_tokens = refreshToken;
        temple.tokens = newToken;
        await temple.save();

        const responseData = {
            temple_id: temple._id,
            temple_name: temple.temple_name,
            mobile_number: temple.mobile_number,
            email: temple.email,
            user_type: temple.user_type,
            location: temple.location,
            state: temple.state,
            enable: temple.enable,
            is_verify: temple.is_verify,
            district: temple.district,
            temple_image_url: temple.temple_image,
            feature_image_url: temple.background_image,
            category: temple.category,
            country: temple.country,
            enable: temple.enable,
            opening_time: temple.opening_time,
            closing_time: temple.closing_time,
            contact_person_name: temple.contact_person_name,
            contact_person_designation: temple.contact_person_designation,
            tokens: temple.tokens,
            refresh_tokens: temple.refresh_tokens,
            created_at: temple.created_at,
            updated_at: temple.updated_at,
            __v: 0
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.temple_login', responseData, req.headers.lang);

    } catch (err) {
        console.log(`Error in templeLogin: `, err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}



exports.logout = async (req, res, next) => {

    try {

        const templeId = req.temple._id;
        let userData = await Temple.findById(templeId);

        if (!userData || (userData.user_type !== constants.USER_TYPE.TEMPLE))
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'TEMPLE.not_found', {}, req.headers.lang);

        userData.tokens = null;
        userData.refresh_tokens = null;
        await userData.save();

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, `TEMPLE.logout_success`, {}, req.headers.lang);

    } catch (err) {
        console.log(`err(TempleLogin)....`, err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}



exports.getTempleProfile = async (req, res) => {

    try {

        const templeId = req.temple._id;
        const { limit } = req.query;
        const templeData = await Temple.findOne({ _id: templeId });

        if (!templeData || (templeData.user_type !== constants.USER_TYPE.TEMPLE))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const response = await axios.get(`${MUXURL}/video/v1/live-streams`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
            }
        });

        const LiveStreamingData = response.data.data.map(stream => stream.id);

        const TempleData = await LiveStreaming.find({ live_stream_id: { $in: LiveStreamingData }, templeId: templeId, status: 'active' }).limit(limit)
            .populate('templeId', 'temple_name temple_image _id state district location mobile_number email contact_person_name category darsan puja contact_person_designation');

        const templeList = await Temple.find({ user_type: 3 }).sort().limit(limit)

        const responseData = {
            temple_data: {
                temple_id: templeData._id,
                temple_name: templeData.temple_name,
                temple_image_url: templeData.temple_image,
                feature_image_url: templeData.background_image,
                mobile_number: templeData.mobile_number,
                email: templeData.email,
                user_type: templeData.user_type,
                location: templeData.location,
                category: templeData.category,
                description: templeData.description,
                country: templeData.country,
                opening_time: templeData.opening_time,
                closing_time: templeData.closing_time,
                live_streaming: templeData.live_streaming,
                puja_list: templeData.puja_list,
                state: templeData.state,
                district: templeData.district,
                contact_person_name: templeData.contact_person_name,
                contact_person_designation: templeData.contact_person_designation,
                date_of_joining: templeData.created_at
            } || {},
            live_aarti: TempleData.map(temple => ({
                playback_id: temple.playback_id,
                live_stream_id: temple.live_stream_id,
                stream_key: temple.stream_key,
                event_type: temple.event_type,
                status: temple.status,
                temple_id: temple.templeId._id,
                temple_name: temple.templeId.temple_name,
                temple_image_url: temple.templeId.temple_image,
                feature_image_url: temple.templeId.background_image,
                mobile_number: temple.templeId.mobile_number,
                email: temple.templeId.email,
                user_type: temple.templeId.user_type,
                location: temple.templeId.location,
                category: temple.templeId.category,
                description: temple.templeId.description,
                country: temple.templeId.country,
                opening_time: temple.templeId.opening_time,
                closing_time: temple.templeId.closing_time,
                live_streaming: temple.templeId.live_streaming,
                puja_list: temple.templeId.puja_list,
                state: temple.templeId.state,
                district: temple.templeId.district,
                contact_person_name: temple.templeId.contact_person_name,
                contact_person_designation: temple.templeId.contact_person_designation,
                published_date: temple.created_at,
                views: '',
            })) || [],
            suggested_temples: templeList.map(temple => ({
                temple_id: temple._id,
                temple_name: temple.temple_name,
                category: temple.category,
                temple_image_url: temple.temple_image,
                feature_image_url: temple.background_image
            })) || []
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_temple_profile', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(getTempleProfile)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.getTempleProfileByAdmin = async (req, res) => {

    try {

        const userId = req.user._id;
        const userData = await User.findById(userId);
        const { templeId } = req.body;
        const { limit } = req.query;
        const templeData = await Temple.findOne({ _id: templeId });

        if (!userData || (userData.user_type !== constants.USER_TYPE.ADMIN))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const response = await axios.get(`${MUXURL}/video/v1/live-streams`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
            }
        });

        const LiveStreamingData = response.data.data.map(stream => stream.id);

        const TempleData = await LiveStreaming.find({ live_stream_id: { $in: LiveStreamingData }, templeId: templeId, status: 'active' }).limit(limit)
            .populate('templeId', 'temple_name temple_image _id state district location mobile_number category puja darsan email contact_person_name contact_person_designation');

        const templeList = await Temple.find({ user_type: 3 }).sort().limit(limit);
        const bankDetails = await TempleBankDetails.findOne({ templeId: templeId });

        if (!bankDetails)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.bank_details_not_found', {}, req.headers.lang);

        const panditList = await Pandit.find({ templeId: templeId });
        const bookingList = await Booking.find({ templeId: templeId });
        const videoList = await Video.find({ templeId: templeId });

        const responseData = {
            temple_data: {
                temple_id: templeData._id,
                temple_name: templeData.temple_name,
                temple_image_url: templeData.temple_image,
                feature_image_url: templeData.background_image,
                mobile_number: templeData.mobile_number,
                email: templeData.email,
                user_type: templeData.user_type,
                location: templeData.location,
                category: templeData.category,
                description: templeData.description,
                country: templeData.country,
                opening_time: templeData.opening_time,
                closing_time: templeData.closing_time,
                live_streaming: templeData.live_streaming,
                puja_list: templeData.puja_list,
                state: templeData.state,
                district: templeData.district,
                contact_person_name: templeData.contact_person_name,
                contact_person_designation: templeData.contact_person_designation,
                date_of_joining: templeData.created_at
            } || {},
            live_aarti: TempleData.map(temple => ({
                playback_id: temple.playback_id,
                live_stream_id: temple.live_stream_id,
                stream_key: temple.stream_key,
                event_type: temple.event_type,
                status: temple.status,
                temple_id: temple.templeId._id,
                temple_name: temple.templeId.temple_name,
                temple_image_url: temple.templeId.temple_image,
                feature_image_url: temple.templeId.background_image,
                mobile_number: temple.templeId.mobile_number,
                email: temple.templeId.email,
                user_type: temple.templeId.user_type,
                location: temple.templeId.location,
                category: temple.templeId.category,
                description: temple.templeId.description,
                country: temple.templeId.country,
                opening_time: temple.templeId.opening_time,
                closing_time: temple.templeId.closing_time,
                darsan: temple.templeId.darsan,
                puja: temple.templeId.puja,
                live_streaming: temple.templeId.live_streaming,
                puja_list: temple.templeId.puja_list,
                state: temple.templeId.state,
                district: temple.templeId.district,
                contact_person_name: temple.templeId.contact_person_name,
                contact_person_designation: temple.templeId.contact_person_designation,
                published_date: temple.created_at,
                views: '',
            })) || [],
            suggested_temples: templeList.map(temple => ({
                temple_id: temple._id,
                temple_name: temple.temple_name,
                category: temple.category,
                temple_image_url: temple.temple_image,
                feature_image_url: temple.background_image
            })) || [],
            bankDetails: {
                bank_id: null || bankDetails._id,
                bank_name: null || bankDetails.bank_name,
                account_number: null || bankDetails.account_number,
                ifsc_code: null || bankDetails.ifsc_code,
                bank_logo: null || bankDetails.bank_logo,
            } || {},
            panditList: panditList.map(data => ({
                full_name: data.full_name,
                email: data.email,
                mobile_number: data.mobile_number,
                temple_id: data.templeId,
                pandit_id: data._id,
            })) || [],
            bookingList: bookingList.map(data => ({
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
            })) || [],
            videoList: videoList.map(data => ({
                video_id: data._id,
                templeId: data.templeId,
                event_type: data.event_type,
                status: data.status,
                description: data.description,
                title: data.title,
                video_url: data.videoUrl,
                playback_id: data.playback_id,
                asset_id: data.asset_id,
            }))
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_temple_profile', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(getTempleProfileByAdmin)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.updateTempleProfile = async (req, res) => {

    try {

        const reqBody = req.body;
        const templeId = req.temple._id;
        const temple = await Temple.findOne({ _id: templeId });

        if (temple.user_type !== constants.USER_TYPE.TEMPLE)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        temple_name = reqBody.temple_name
        mobile_number = reqBody.mobile_number,
            email = reqBody.email,
            location = reqBody.location,
            state = reqBody.state,
            district = reqBody.district,
            contact_person_name = reqBody.contact_person_name,
            contact_person_designation = reqBody.contact_person_designation,
            opening_time = reqBody.opening_time
        closing_time = reqBody.closing_time
        category = reqBody.category
        description = reqBody.description
        country = reqBody.country

        const templeData = await Temple.findOneAndUpdate({ _id: templeId }, reqBody, { new: true })

        if (!templeData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.not_found', {}, req.headers.lang);

        const responseData = {
            temple_id: templeData._id,
            temple_name: templeData.templeData_name,
            temple_image_url: templeData.temple_image,
            feature_image_url: templeData.background_image,
            mobile_number: templeData.mobile_number,
            email: templeData.email,
            user_type: templeData.user_type,
            location: templeData.location,
            state: templeData.state,
            district: templeData.district,
            category: templeData.category,
            description: templeData.description,
            country: templeData.country,
            contact_person_name: templeData.contact_person_name,
            contact_person_designation: templeData.contact_person_designation,
            opening_time: templeData.opening_time,
            closing_time: templeData.closing_time,
            updated_at: templeData.updated_at
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.update_temple_profile', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(updateTempleProfile)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};




exports.CreateNewLiveStreamByTemple = async (req, res) => {

    const templeId = req.temple._id;
    const reqBody = req.body;
    const temple = await Temple.findById(templeId)

    if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLE))
        return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

    const requestData = {
        "playback_policy": [
            "public"
        ],
        "new_asset_settings": {
            "playback_policy": "public",
            "max_resolution_tier": "1080p",
            "generated_subtitles": [
                {
                    "name": "Auto-generated Subtitles",
                    "language_code": "en"
                }
            ]
        }
    };

    try {
        const response = await axios.post(
            `${MUXURL}/video/v1/live-streams`,
            requestData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        const ids = response.data.data.playback_ids.map((item) => item.id);

        const liveStreamData = {
            description: reqBody.description,
            title: reqBody.title,
            stream_key: response.data.data.stream_key,
            status: response.data.data.status,
            reconnect_window: response.data.data.reconnect_window,
            max_continuous_duration: response.data.data.max_continuous_duration,
            latency_mode: response.data.data.latency_mode,
            live_stream_id: response.data.data.id,
            playback_id: ids[0],
            created_at: response.data.data.created_at,
            templeId: templeId
        } || {}

        const liveStreamingData = await LiveStreaming.create(liveStreamData)

        const responseData = {
            id: liveStreamingData._id,
            description: liveStreamingData.description,
            title: liveStreamingData.title,
            stream_key: liveStreamingData.stream_key,
            plackback_id: liveStreamingData.plackback_id,
            live_stream_id: liveStreamingData.live_stream_id,
            created_at: liveStreamingData.created_at,
            temple_id: liveStreamingData.templeId,
            status: liveStreamingData.status,
            event_type: liveStreamingData.event_type
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'GURU.guru_live_stream_created', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(CreateNewLiveStreamByTemple)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.getTempleLiveStream = async (req, res) => {

    try {

        const { limit } = req.query;

        // Fetch live streams from MUX
        const response = await axios.get(`${MUXURL}/video/v1/live-streams`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
            }
        });

        const LiveStreamingData = response.data.data.map(stream => stream.id);

        const allTempleData = await Temple.find();
        const allTempleId = allTempleData.map(temple => temple._id);

        const liveStreamData = await LiveStreaming.find({
            live_stream_id: { $in: LiveStreamingData },
            templeId: { $in: allTempleId }, status: 'active'
        }).limit(parseInt(limit));

        if (!liveStreamData || liveStreamData.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.Live_stream_not_found', [], req.headers.lang);

        // Format the response data
        const responseData = await Promise.all(liveStreamData.map(async livestream => {
            const templeDetails = await Temple.findOne({ _id: livestream.templeId });
            if (!templeDetails) return null;

            return {
                playback_id: livestream.playback_id,
                live_stream_id: livestream.live_stream_id,
                stream_key: livestream.stream_key,
                status: livestream.status,
                temple_id: templeDetails._id,
                temple_name: templeDetails.temple_name,
                temple_image_url: templeDetails.temple_image,
                feature_image_url: templeDetails.background_image,
                title: livestream.title,
                description: livestream.description,
                location: templeDetails.location,
                state: templeDetails.state,
                district: templeDetails.district,
                published_date: new Date(),
                views: '',
            };
        }));

        const filteredResponseData = responseData.filter(item => item !== null);

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_Live_Stream_By_Guru', filteredResponseData, req.headers.lang);

    } catch (err) {
        console.error("Error in getTempleLiveStream:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};




exports.temple_suggested_videos = async (req, res) => {

    try {

        const templeId = req.temple._id;
        const { limit } = req.query;
        const temple = await Temple.findById(templeId)

        if (temple.user_type !== constants.USER_TYPE.TEMPLE)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const response = await axios.get(
            `${MUXURL}/video/v1/assets`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        const assetsId = response.data.data.map(asset => asset.id);
        const videoData = await Video.find({ asset_id: { $in: assetsId }, templeId: templeId }).sort({ created_at: -1 }).limit(parseInt(limit));

        if (!videoData || videoData.length == 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.video_not_found', [], req.headers.lang);

        const matchedData = response.data.data.filter(user => {
            return videoData.some(muxData => muxData.asset_id === user.id);
        });

        console.log("adata" , matchedData[0].duration)

        const responseData = videoData.map(video => ({
            video_id: video._id,
            event_type: video.event_type,
            status: video.status,
            description: video.description,
            title: video.title,
            video_url: video.videoUrl,
            playback_id: video.playback_id,
            asset_id: video.asset_id,
            duration: minutesToSeconds(matchedData[0].duration),
            created_at: video.created_at,
            temple_id: video.templeId,
        })) || [];

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_all_the_suggested_videos', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(temple_suggested_videos)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};


exports.temple_suggested_videos_by_admin = async (req, res) => {

    try {

        const userId = req.user._id
        const user = await User.findById(userId)
        const { limit, templeId } = req.query;

        if (user.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const response = await axios.get(
            `${MUXURL}/video/v1/assets`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        const assetsId = response.data.data.map(asset => asset.id);
        console.log("1111")
        const videoData = await Video.find({ 'muxData.asset_id': { $in: assetsId }, templeId: templeId }).sort({ created_at: -1 }).limit(parseInt(limit));

        console.log("222")
        if (!videoData || videoData.length == 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.video_not_found', [], req.headers.lang);

        const matchedData = response.data.data.filter(user => {
            return videoData.some(muxData => muxData.muxData.asset_id === user.id);
        });

        console.log("data...", videoData)
        const responseData = videoData.map(video => ({
            plackback_id: video.muxData.playback_id,
            asset_id: video.muxData.asset_id,
            description: video.description,
            title: video.title,
            video_url: video.videoUrl,
            id: video._id,
            templeId: video.templeId,
            duration: minutesToSeconds(matchedData[0].duration),
            created_at: video.created_at,
        })) || [];

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_all_the_suggested_videos', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(temple_suggested_videos_by_admin)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.addBankDetailsByAdmin = async (req, res) => {

    try {

        const userId = req.user._id;
        const reqBody = req.body;
        const user = await User.findOne({ _id: userId });

        if (!user || (user.user_type !== constants.USER_TYPE.ADMIN))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        let files = req.file;
        reqBody.bank_logo = `${BASEURL}/uploads/${files.filename}`;
        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();
        const addBank = await Bank.create(reqBody);

        let data = {
            bank_id: addBank._id,
            bank_name: addBank.bank_name,
            bank_logo: addBank.bank_logo
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'TEMPLE.add_bank_details', data, req.headers.lang);

    } catch (err) {
        console.error('Error(addBankDetailsByAdmin)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.AllBankList = async (req, res) => {

    try {

        const userId = req.user._id
        const user = await User.findOne({ _id: userId });

        if (!user || (user.user_type !== constants.USER_TYPE.ADMIN))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const addBank = await Bank.find().sort().limit(req.query.limit)

        if (!addBank || addBank.length == 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.bank_details_not_found', [], req.headers.lang);

        const data = addBank.map(data => ({
            bank_id: data._id,
            bank_name: data.bank_name,
            bank_logo: data.bank_logo
        })) || [];

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_all_bank_details', data, req.headers.lang);

    } catch (err) {
        console.error('Error(AllBankList)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};


exports.masterBankList = async (req, res) => {

    try {

        const templeId = req.temple._id
        const temple = await Temple.findOne({ _id: templeId });

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLE))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const addBank = await Bank.find().sort().limit(req.query.limit)

        if (!addBank || addBank.length == 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.bank_details_not_found', [], req.headers.lang);

        const data = addBank.map(data => ({
            bank_id: data._id,
            bank_name: data.bank_name,
            bank_logo: data.bank_logo
        })) || [];

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_all_bank_details', data, req.headers.lang);

    } catch (err) {
        console.error('Error(masterBankList)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.addBankDetails = async (req, res) => {

    try {

        const templeId = req.temple._id;
        const reqBody = req.body;
        const temple = await Temple.findOne({ _id: templeId });
        const { master_bank_id } = reqBody;

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLE))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const addBank = await Bank.findOne({ _id: master_bank_id });

        if (!addBank)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.bank_details_not_found', [], req.headers.lang);

        if (addBank.bank_name !== reqBody.bank_name)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'TEMPLE.valid_bank_name', {}, req.headers.lang);

        reqBody.master_bank_id = master_bank_id,
            reqBody.bank_logo = addBank.bank_logo;
        reqBody.templeId = templeId;
        const bank = await TempleBankDetails.create(reqBody)

        let data = {
            master_bank_id: master_bank_id,
            bank_id: bank._id,
            bank_name: bank.bank_name,
            account_number: bank.account_number,
            bank_logo: bank.bank_logo,
            ifsc_code: bank.ifsc_code,
            temple_id: bank.templeId
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'TEMPLE.add_bank_details', data, req.headers.lang);

    } catch (err) {
        console.error('Error(addBankDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};


exports.getBankDetails = async (req, res) => {

    try {

        const templeId = req.temple._id;

        const templeData = await Temple.findById(templeId);

        if (!templeData || templeData.user_type !== constants.USER_TYPE.TEMPLE)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const bank = await TempleBankDetails.findOne({ templeId: templeId }).populate('templeId', 'temple_name temple_image _id');

        if (!bank)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.bank_details_not_found', {}, req.headers.lang);

        const data = {
            master_bank_id: bank.master_bank_id,
            bank_id: bank._id,
            bank_name: bank.bank_name,
            account_number: bank.account_number,
            ifsc_code: bank.ifsc_code,
            bank_logo: bank.bank_logo,
            temple_id: bank.templeId._id
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_bankDetails', data, req.headers.lang);

    } catch (err) {
        console.error('Error(getBankDetails):', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};


exports.updateBankDetails = async (req, res) => {

    try {

        const templeId = req.temple._id;
        const reqBody = req.body;

        const templeData = await Temple.findById(templeId);

        if (!templeData || templeData.user_type !== constants.USER_TYPE.TEMPLE)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const bank = await TempleBankDetails.findOne({ templeId: templeId }).populate('templeId', 'temple_name temple_image _id');

        if (!bank)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.bank_details_not_found', {}, req.headers.lang);

        if (reqBody.bank_name) {
            bank.bank_name = reqBody.bank_name;
        }
        if (reqBody.account_number) {
            bank.account_number = reqBody.account_number;
        }
        if (reqBody.ifsc_code) {
            bank.ifsc_code = reqBody.ifsc_code;
        }
        await bank.save();

        const data = {
            master_bank_id: bank.master_bank_id,
            bank_id: bank._id,
            bank_name: bank.bank_name,
            account_number: bank.account_number,
            ifsc_code: bank.ifsc_code,
            bank_logo: bank.bank_logo,
            temple_id: bank.templeId._id
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.update_bank_details', data, req.headers.lang);

    } catch (err) {
        console.error('Error(updateBankDetails):', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.deleteBankDetails = async (req, res) => {

    try {


        const templeId = req.temple._id;

        const templeData = await Temple.findById(templeId);

        if (!templeData || templeData.user_type !== constants.USER_TYPE.TEMPLE)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const banks = await TempleBankDetails.findOneAndDelete({ templeId: templeId });

        if (!banks)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.bank_details_not_found', {}, req.headers.lang);

        let data = {
            bank_id: banks._id,
            bank_name: banks.bank_name,
            account_number: banks.account_number,
            ifsc_code: banks.ifsc_code,
            temple_id: banks.templeId
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.delete_bank_details', data, req.headers.lang);

    } catch (err) {
        console.error('Error(deleteBankDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.addpanditDetails = async (req, res) => {

    try {

        const templeId = req.temple._id;
        const reqBody = req.body;
        const temple = await Temple.findOne({ _id: templeId });

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLE))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();

        const existEmail = await Pandit.findOne({ email: reqBody.email });
        if (existEmail)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAI4, 'TEMPLE.email_already_exist', {}, req.headers.lang);

        reqBody.templeId = templeId;
        const addpandit = await Pandit.create(reqBody);

        let data = {
            pandit_id: addpandit._id,
            full_name: addpandit.full_name,
            email: addpandit.email,
            mobile_number: addpandit.mobile_number,
            temple_name: addpandit.templeId.temple_name,
            temple_image: addpandit.templeId.temple_image,
            temple_id: addpandit.templeId._id,
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'TEMPLE.add_pandit_details', data, req.headers.lang);

    } catch (err) {
        console.error('Error(addpanditDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.getAllpanditList = async (req, res) => {

    try {

        const templeId = req.temple._id;
        const temple = await Temple.findOne({ _id: templeId });

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLE))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const pandit = await Pandit.find({ templeId: templeId })

        if (!pandit || pandit.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.not_found_pandit', [], req.headers.lang);

        const responseData = pandit.map(data => ({
            full_name: data.full_name,
            email: data.email,
            mobile_number: data.mobile_number,
            temple_id: data.templeId,
            pandit_id: data._id,
        })) || []

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_pandit_details', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(getAllpanditList)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.UpdatepanditDetails = async (req, res) => {

    try {

        const { panditId } = req.params;
        const templeId = req.temple._id;
        const reqBody = req.body;
        const temple = await Temple.findOne({ _id: templeId });

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLE))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const pandit = await Pandit.findOne({ _id: panditId, templeId: templeId })

        if (!pandit)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.not_found_pandit', {}, req.headers.lang);

        if (reqBody.full_name) {
            pandit.full_name = reqBody.full_name;
        }
        if (reqBody.email) {
            pandit.email = reqBody.email;
        }
        if (reqBody.mobile_number) {
            pandit.mobile_number = reqBody.mobile_number;
        }
        await pandit.save();

        let data = {
            full_name: pandit.full_name,
            email: pandit.email,
            mobile_number: pandit.mobile_number,
            pandit_id: pandit._id,
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.update_pandit_details', data, req.headers.lang);

    } catch (err) {
        console.error('Error(UpdatepanditDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.deletePanditDetails = async (req, res) => {

    try {

        const { panditId } = req.params;
        const templeId = req.temple._id;
        const temple = await Temple.findOne({ _id: templeId });

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLE))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const pandit = await Pandit.findOneAndDelete({ _id: panditId, templeId: templeId })

        if (!pandit)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.not_found_pandit', {}, req.headers.lang);

        let data = {
            full_name: pandit.full_name,
            email: pandit.email,
            mobile_number: pandit.mobile_number,
            pandit_id: pandit._id,

        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.delete_pandit_details', data, req.headers.lang);

    } catch (err) {
        console.error('Error(deletePanditDetails)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.generate_refresh_tokens = async (req, res, next) => {

    try {

        let temple = await TempleGuru.findOne({ refresh_tokens: req.body.refresh_tokens });

        if (!temple)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.token_expired', {}, req.headers.lang);

        let newToken = await temple.generateAuthToken();
        let refresh_token = await temple.generateRefreshToken()

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



exports.TempleBookingAndLiveStreamingReports = async (req, res) => {

    try {

        const templeId = req.temple._id;
        const temple = await Temple.findOne({ _id: templeId });

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLE))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const totalVideos = await Video.countDocuments({ templeId: templeId });
        const totalLiveStreaming = await LiveStreaming.countDocuments({ templeId: templeId });
        const totalBookings = await Booking.countDocuments({ templeId: templeId });
        const totalBookingCancal = await Booking.countDocuments({ templeId: templeId, status: 'cancel' });

        const responseData = {
            totalVideos: totalVideos || 0,
            totalLiveStreaming: totalLiveStreaming || 0,
            totalBookingCancal: totalBookingCancal || 0,
            totalBookings: totalBookings || 0,
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.temple_reports', responseData, req.headers.lang);

    } catch (err) {
        console.log('err(TempleBookingAndLiveStreamingReports)', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.templeUnderAllLiveStreamingVideos = async (req, res) => {

    try {

        const templeId = req.temple._id;
        const { limit } = req.query;
        const temple = await Temple.findById(templeId);

        if (!temple || (temple.user_type !== constants.USER_TYPE.TEMPLE))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

        const response = await axios.get(`${MUXURL}/video/v1/live-streams`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
            }
        });

        const LiveStreamingData = response.data.data.map(stream => stream.id);

        const liveStreamData = await LiveStreaming.find({
            live_stream_id: { $in: LiveStreamingData },
            templeId: templeId,
        }).limit(parseInt(limit));

        if (!liveStreamData || liveStreamData.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.Live_stream_not_found', [], req.headers.lang);

        const assetResponse = await axios.get(`${MUXURL}/video/v1/assets`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
            }
        });

        const liveStreamIds = liveStreamData.map(data => data.live_stream_id);
        const matchedAssets = assetResponse.data.data.filter(asset => liveStreamIds.includes(asset.live_stream_id));

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.temple_all_live_streaming_videos', matchedAssets, req.headers.lang);

    } catch (err) {
        console.log('err(templeUnderAllLiveStreamingVideos)', err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


