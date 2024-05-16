

const { sendResponse } = require('../../services/common.service')
const { BASEURL } = require('../../keys/development.keys')
const constants = require("../../config/constants");
const { checkAdmin } = require('../../v1/services/user.service')
const dateFormat = require('../../helper/dateformat.helper');
const Guru = require('../../models/guru.model');
const bcrypt = require('bcryptjs')
const { isValid } = require("../../services/blackListMail");
const { MUX_TOKEN_ID, MUX_TOKEN_SECRET, MUXURL, WEBHOOKSCRETKEY } = require('../../keys/development.keys')
const axios = require('axios');
const { guruResponseData, guruLiveStreamResponse, guruLoginResponse } = require('../../ResponseData/Guru.response')
const Video = require('../../models/uploadVideo.model');
const User = require('../../models/user.model');
const { v4: uuidv4 } = require('uuid');
const LiveStreaming = require('../../models/live.streaming.model')
const { minutesToSeconds, verifyWebhookSignature, handleActiveLiveStream, getLiveStreamInfo } = require('../services/views.services');
const { GURU } = require('../../lang/en/message');







exports.signUp = async (req, res) => {

    try {

        const reqBody = req.body;

        const isBlacklisted = await isValid(reqBody.email);
        if (!isBlacklisted)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);

        const existingEmail = await Guru.findOne({ email: reqBody.email });
        if (existingEmail)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GURU.existing_email', {}, req.headers.lang);

        const hashedPassword = await bcrypt.hash(reqBody.password, 10);
        reqBody.password = hashedPassword;
        reqBody.created_at = dateFormat.set_current_timestamp();
        reqBody.updated_at = dateFormat.set_current_timestamp();

        const guru = await Guru.create(reqBody);

        const responseData = {
            guru_id: guru._id,
            guru_name: guru.guru_name,
            email: guru.email,
            mobile_number: guru.mobile_number,
            expertise: guru.expertise,
            adharacard: guru.adharacard,
            description: guru.description,
            user_type: guru.user_type,
            status: guru.status,
            is_verify: guru.is_verify,
            state: guru.state,
            district: guru.district,
            location: guru.location,
            created_at: guru.created_at,
            updated_at: guru.updated_at
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'GURU.signup_success', responseData, req.headers.lang);

    } catch (error) {
        console.error('Error(signUp).....', error);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', error.message, req.headers.lang);
    }
};


exports.uploadGuruImage = async (req, res) => {

    try {

        const { guruId } = req.params;
        const guru = await Guru.findById(guruId);

        if (!guru || (guru.user_type !== constants.USER_TYPE.GURU))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        if (!req.files || (!req.files['profile_image'] && !req.files['background_image']))
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GURU.upload_image', {}, req.headers.lang);

        const guru_image_url = `${BASEURL}/uploads/${req.files['profile_image'][0].filename}`;
        guru.guru_image = guru_image_url;
        const background_image_url = `${BASEURL}/uploads/${req.files['background_image'][0].filename}`;
        guru.background_image = background_image_url;
        await guru.save()

        const responseData = {
            guru_id: guru._id,
            guru_name: guru.guru_name,
            guru_image_url: guru.guru_image,
            feature_image_url: guru.background_image,
            email: guru.email,
            mobile_number: guru.mobile_number,
            expertise: guru.expertise,
            adharacard: guru.adharacard,
            description: guru.description,
            user_type: guru.user_type,
            status: guru.status,
            is_verify: guru.is_verify,
            state: guru.state,
            district: guru.district,
            location: guru.location,
            updated_at: guru.updated_at
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.upload_success', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(uploadGuruImage)........:', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.guruAccountVerify = async (req, res) => {

    try {

        const { guruId } = req.params;
        const userId = req.user._id;
        const user = await User.findById(userId)

        if (user.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const guru = await Guru.findOneAndUpdate({ _id: guruId }, { $set: { is_verify: true } }, { new: true });

        if (!guru)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.guru_not_found', {}, req.headers.lang);

        const responseData = {
            guru_id: guru._id,
            guru_name: guru.guru_name,
            guru_image_url: guru.guru_image,
            feature_image_url: guru.background_image,
            email: guru.email,
            mobile_number: guru.mobile_number,
            expertise: guru.expertise,
            adharacard: guru.adharacard,
            description: guru.description,
            user_type: guru.user_type,
            status: guru.status,
            is_verify: guru.is_verify,
            state: guru.state,
            district: guru.district,
            location: guru.location,
            updated_at: guru.updated_at
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.account_verify', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(guruAccountVerify)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }

}




exports.login = async (req, res) => {

    try {

        const reqBody = req.body;
        const { email, password } = reqBody;

        const guru = await Guru.findOne({ email });

        if (!guru || (guru.user_type !== constants.USER_TYPE.GURU))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const matchPassword = await bcrypt.compare(password, guru.password);
        if (!matchPassword)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.invalid_password', {}, req.headers.lang);

        if (guru.is_verify === false)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GURU.guru_was_not_verify', {}, req.headers.lang);

        if (guru)
            if (guru.status === 0 || guru.status === 2 || guru.deleted_at !== null) {
                let errorMsg;
                if (guru.status === 0) errorMsg = 'USER.inactive_account';
                else if (guru.status === 2) errorMsg = 'USER.deactive_account';
                else errorMsg = 'USER.inactive_account';
                return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, errorMsg, {}, req.headers.lang);
            }

        const newToken = await guru.generateAuthToken();
        const refreshToken = await guru.generateRefreshToken();

        guru.refresh_tokens = refreshToken;
        guru.tokens = newToken;
        await guru.save();

        const responseData = {
            guru_id: guru._id,
            guru_name: guru.guru_name,
            email: guru.email,
            mobile_number: guru.mobile_number,
            expertise: guru.expertise,
            adharacard: guru.adharacard,
            description: guru.description,
            user_type: guru.user_type,
            is_verify: guru.is_verify,
            state: guru.state,
            district: guru.district,
            location: guru.location,
            status: guru.status,
            tokens: guru.tokens,
            refresh_tokens: guru.refresh_tokens,
            created_at: guru.created_at,
            updated_at: guru.updated_at,
            __v: 0
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.login_success', responseData, req.headers.lang);

    } catch (err) {
        console.log(`err(guruLogin).... `, err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}



exports.logout = async (req, res, next) => {

    try {

        const templeId = req.guru._id;
        let guruData = await Guru.findById(templeId);

        if (!guruData || (guruData.user_type !== constants.USER_TYPE.GURU))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GURU.guru_not_found', {}, req.headers.lang);

        guruData.tokens = null;
        guruData.refresh_tokens = null;
        await guruData.save();
        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, `GURU.guru_logout`, {}, req.headers.lang);

    } catch (err) {
        console.log(`err(logout)....`, err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}



exports.getGuruProfile = async (req, res) => {

    try {

        const guruId = req.guru._id;
        const { limit } = req.query;
        const guruData = await Guru.findOne({ _id: guruId });

        if (!guruData || (guruData.user_type !== constants.USER_TYPE.GURU))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.invalid_user', {}, req.headers.lang);

        const response = await axios.get(`${MUXURL}/video/v1/live-streams`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
            }
        });

        const LiveStreamingData = response.data.data.map(stream => stream.id);

        const GuruData = await LiveStreaming.find({ live_stream_id: { $in: LiveStreamingData }, guruId: guruId }).limit(limit)
            .populate('guruId', 'guru_name guru_image _id email mobile_number gurus_id expertise created_at');

        const guruList = await Guru.find({ user_type: 4 }).sort().limit(limit)

        const responseData = {
            guru_data: {
                guru_id: guruData._id,
                guru_name: guruData.guruData_name,
                email: guruData.email,
                mobile_number: guruData.mobile_number,
                expertise: guruData.expertise,
                adharacard: guruData.adharacard,
                description: guruData.description,
                state: guruData.state,
                district: guruData.district,
                location: guruData.location,
                user_type: guruData.user_type,
                guru_image_url: guruData.guru_image,
                feature_image_url: guruData.background_image,
                date_of_joining: guruData.created_at
            } || {},
            live_aarti: GuruData.map(guru => ({
                playback_id: guru.playback_id,
                live_stream_id: guru.live_stream_id,
                stream_key: guru.stream_key,
                guru_name: guru.guruId.guru_name,
                guru_image_url: guru.guruId.guru_image,
                feature_image_url: guru.guruId.background_image,
                title: guru.title,
                description: guru.description,
                guru_id: guru._id,
                expertise: guru.guruId.expertise,
                email: guru.guruId.email,
                mobile_number: guru.guruId.mobile_number,
                published_date: new Date(),
                views: '',
                guru_id: guru.guruId._id
            })) || [],
            suggested_gurus: guruList.map(guru => ({
                guru_name: guru.guru_name,
                guru_image_url: guru.guru_image,
                guru_id: guru._id,
                created_at: guru.created_at
            })) || []
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_guru_profile', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(getGuruProfile)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.getGuruProfileByAdmin = async (req, res) => {

    try {

        const userId = req.user._id;
        const { limit } = req.query;
        const { guruId } = req.params;

        const users = await User.findById(userId)

        if (!users || (users.user_type !== constants.USER_TYPE.ADMIN))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.invalid_user', {}, req.headers.lang);

        const guruData = await Guru.findOne({ _id: guruId });

        const response = await axios.get(`${MUXURL}/video/v1/live-streams`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
            }
        });

        const LiveStreamingData = response.data.data.map(stream => stream.id);

        const GuruData = await LiveStreaming.find({ live_stream_id: { $in: LiveStreamingData }, guruId: guruId }).limit(limit)
            .populate('guruId', 'guru_name guru_image _id email mobile_number gurus_id expertise created_at');

        const guruList = await Guru.find({ user_type: 4 }).sort().limit(limit)

        const responseData = {
            guru_data: {
                guru_id: guruData._id,
                guru_name: guruData.guruData_name,
                email: guruData.email,
                mobile_number: guruData.mobile_number,
                expertise: guruData.expertise,
                adharacard: guruData.adharacard,
                state: guruData.state,
                district: guruData.district,
                location: guruData.location,
                description: guruData.description,
                user_type: guruData.user_type,
                guru_image_url: guruData.guru_image,
                feature_image_url: guruData.background_image,
                date_of_joining: guruData.created_at
            } || {},
            live_aarti: GuruData.map(guru => ({
                playback_id: guru.playback_id,
                live_stream_id: guru.live_stream_id,
                stream_key: guru.stream_key,
                guru_name: guru.guruId.guru_name,
                guru_image_url: guru.guruId.guru_image,
                feature_image_url: guru.guruId.background_image,
                title: guru.title,
                description: guru.description,
                guru_id: guru._id,
                expertise: guru.guruId.expertise,
                email: guru.guruId.email,
                mobile_number: guru.guruId.mobile_number,
                published_date: new Date(),
                views: '',
                guru_id: guru.guruId._id
            })) || [],
            suggested_gurus: guruList.map(guru => ({
                guru_name: guru.guru_name,
                guru_image_url: guru.guru_image,
                guru_id: guru._id,
                created_at: guru.created_at
            })) || []
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.get_guru_profile', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(getGuruProfileByAdmin)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.SearchAllGuru = async (req, res) => {

    try {

        const userId = req.user._id;
        const { sort, guruname, email, expertise, mobile_number, is_verify, state, location, limit } = req.query;
        const users = await User.findById(userId)

        if (!users || ![constants.USER_TYPE.ADMIN, constants.USER_TYPE.USER].includes(users.user_type))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.invalid_user', {}, req.headers.lang);

        const query = { user_type: 4 };

        if (email) {
            const emailRegex = new RegExp(email.split(' ').join('|'), 'i');
            query.email = emailRegex;
        }

        if (state) {
            const stateRegex = new RegExp(state.split(' ').join('|'), 'i');
            query.state = stateRegex;
        }

        if (location) {
            const locationRegex = new RegExp(location.split(' ').join('|'), 'i');
            query.location = locationRegex;
        }
        if (is_verify) {
            query.is_verify = is_verify
        }

        if (guruname) {
            const gurunameRegex = new RegExp(guruname.split(' ').join('|'), 'i');
            query.guru_name = gurunameRegex;
        }

        if (expertise) {
            const expertiseRegex = new RegExp(expertise.split(' ').join('|'), 'i');
            query.expertise = expertiseRegex;
        }

        if (mobile_number) {
            query.mobile_number = mobile_number;
        }

        const sortOptions = {};
        if (sort) {
            const [field, order] = sort.split(':');
            sortOptions[field] = order === 'desc' ? -1 : 1;
        }

        let guruData;
        let totalGurus
        const selectFields = '_id guru_name email adharacard description mobile_number expertise gurus_id guru_image background_image state district location created_at updated_at'
        if (query.length === 0) {
            [guruData, totalGurus] = await Promise.all([
                Guru.find({ user_type: 4 })
                    .select(selectFields)
                    .populate('temple_id', 'temple_name temple_image location state district _id user_type')
                    .sort(sortOptions)
                    .limit(parseInt(limit)),
                Guru.countDocuments({ user_type: 4 })
            ]);
        }

        [guruData, totalGurus] = await Promise.all([
            Guru.find(query)
                .select(selectFields)
                .populate('temple_id', 'temple_name temple_image location state district _id user_type')
                .sort(sortOptions)
                .limit(parseInt(limit)),
            Guru.countDocuments(query)
        ]);


        const responseData = guruData.map(guru => ({
            total_gurus: totalGurus,
            guru_id: guru._id,
            guru_name: guru.guru_name,
            email: guru.email,
            mobile_number: guru.mobile_number,
            expertise: guru.expertise,
            adharacard: guru.adharacard,
            description: guru.description,
            user_type: guru.user_type,
            state: guru.state,
            district: guru.district,
            location: guru.location,
            guru_image_url: guru.guru_image,
            feature_image_url: guru.background_image,
            created_at: guru.created_at
        })) || [];

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_all_gurus', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(SearchAllGuru)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.GuruCreateNewLiveStream = async (req, res) => {

    const guruId = req.guru._id;
    const reqBody = req.body;
    const guru = await Guru.findById(guruId);

    if (!guru || (guru.user_type !== constants.USER_TYPE.GURU))
        return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.invalid_user', {}, req.headers.lang);

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
            guruId: guruId,
        }

        const guruData = await LiveStreaming.create(liveStreamData)

        const responseData = {
            id: guruData._id,
            stream_key: guruData.stream_key,
            description: guruData.description,
            title: guruData.title,
            description: guruData.description,
            plackback_id: guruData.plackback_id,
            live_stream_id: guruData.live_stream_id,
            guru_id:guruData.guruId,
            created_at: guruData.created_at,
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'GURU.guru_live_stream_created', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(GuruCreateNewLiveStream)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.getLiveStreamByGuru = async (req, res) => {

    try {

        const { limit } = req.query;

        const response = await axios.get(`${MUXURL}/video/v1/live-streams`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
            }
        });

        const allGuruData = await Guru.find();
        const allGuruId = allGuruData.map(guru => guru._id);
      
        const LiveStreamingData = response.data.data.map(stream => stream.id);
        const GuruData = await LiveStreaming.find({
            live_stream_id: { $in: LiveStreamingData }, guruId: { $in: allGuruId }
        }).limit(limit)

        if (!GuruData || GuruData.length == 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.live_stream_data_not_found', [], req.headers.lang);

        const responseData = await Promise.all(GuruData.map(async guru => {
            const guruDetails = await Guru.findById(guru.guruId);
            return {
                playback_id: guru.playback_id,
                live_stream_id: guru.live_stream_id,
                stream_key: guru.stream_key,
                guru_id: guru.guruId,
                title: guru.title,
                description: guru.description,
                published_date: new Date(),
                views: ''
            };
        })) || [];

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_Live_Stream_By_Guru', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(getLiveStreamByGuru)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang); // Ensure sendResponse function is correctly defined and imported
    }
};


exports.guru_suggested_videos = async (req, res) => {

    try {

        const guruId = req.guru._id;
        const { limit } = req.query;
        const guru = await Guru.findById(guruId);

        if (!guru || (guru.user_type !== constants.USER_TYPE.GURU))
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

        const videoData = await Video.find({ 'muxData.asset_id': { $in: assetsId }, guruId: guruId }).sort({ created_at: -1 }).limit(parseInt(limit));

        const matchedData = response.data.data.filter(user => {
            return videoData.some(muxData => muxData.muxData.asset_id === user.id);
        });

        const responseData = videoData.map(video => ({
            plackback_id: video.muxData.playback_id,
            asset_id: video.muxData.asset_id,
            description: video.description,
            title: video.title,
            video_url: video.videoUrl,
            id: video._id,
            duration: minutesToSeconds(matchedData[0].duration),
            created_at: video.created_at,
            guru_id: video.guruId,
        })) || []

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_all_the_suggested_videos', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(guru_suggested_videos)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};


exports.guru_suggested_videos_by_admin = async (req, res) => {

    try {

        const userId = req.user._id;
        console.log(userId, "111")
        const user = await User.findById(userId);
        const { limit, guruId } = req.query;

        if (!user || (user.user_type !== constants.USER_TYPE.ADMIN))
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

        const videoData = await Video.find({ 'muxData.asset_id': { $in: assetsId }, guruId: guruId }).sort({ created_at: -1 }).limit(parseInt(limit));

        const matchedData = response.data.data.filter(user => {
            return videoData.some(muxData => muxData.muxData.asset_id === user.id);
        });

        const responseData = videoData.map(video => ({
            plackback_id: video.muxData.playback_id,
            asset_id: video.muxData.asset_id,
            description: video.description,
            title: video.title,
            video_url: video.videoUrl,
            id: video._id,
            duration: minutesToSeconds(matchedData[0].duration),
            created_at: video.created_at,
            guru_id: video.guruId,
        })) || []

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_all_the_suggested_videos', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(guru_suggested_videos_by_admin)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};


exports.updateGuruProfile = async (req, res) => {

    try {

        const guruId = req.guru._id;
        const { guru_name, email, mobile_number, description, adharacard, expertise } = req.body;
        const guruData = await Guru.findOne({ _id: guruId });

        if (!guruData || (guruData.user_type !== constants.USER_TYPE.GURU))
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        if (adharacard) {
            guruData.adharacard = adharacard;
        }

        if (description) {
            guruData.description = description;
        }

        if (guru_name) {
            guruData.guru_name = guru_name;
        }

        if (email) {
            guruData.email = email;
        }

        if (expertise) {
            guruData.expertise = expertise;
        }

        if (mobile_number) {
            guruData.mobile_number = mobile_number;
        }

        if (state) {
            guruData.state = state;
        }

        if (location) {
            guruData.location = location;
        }

        if (district) {
            guruData.district = district;
        }


        guruData.updated_at = dateFormat.set_current_timestamp()
        await guruData.save();

        const responseData = {
            guru_id: guruData._id,
            guru_name: guruData.guru_name,
            guru_image_url: guruData.guru_image,
            feature_image_url: guruData.background_image,
            description: guruData.description,
            email: guruData.email,
            state: guruData.state,
            district: guruData.district,
            location: guruData.location,
            expertise: guruData.expertise,
            mobile_number: guruData.mobile_number,

        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.update_guru', responseData, req.headers.lang);

    } catch (err) {
        console.error('Error(updateGuruProfile)....', err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.guruDelete = async (req, res) => {

    try {

        const { guruId } = req.params;
        const userId = req.user._id;
        const user = await checkAdmin(userId);

        if (user.user_type !== constants.USER_TYPE.ADMIN)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const guruData = await Guru.findOneAndDelete({ _id: guruId });

        if (!guruData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.guru_not_found', {}, req.headers.lang);

        const responseData = {
            guru_id: guruData._id,
            guru_name: guruData.guru_name,
            guru_image_url: guruData.guru_image,
            feature_image_url: guruData.background_image,
            description: guruData.description,
            email: guruData.email,
            state: guruData.state,
            district: guruData.district,
            location: guruData.location,
            expertise: guruData.expertise,
            mobile_number: guruData.mobile_number,
        }
        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.delete_guru', responseData, req.headers.lang);

    } catch (err) {
        console.log("err(guruDelete)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }

}

