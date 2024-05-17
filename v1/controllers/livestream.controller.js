const axios = require('axios');
const dateFormat = require('../../helper/dateformat.helper');
const { sendResponse } = require("../../services/common.service");
const { WEB_STATUS_CODE, STATUS_CODE } = require('../../config/constants');
const { MUX_TOKEN_ID, MUX_TOKEN_SECRET, MUXURL } = require('../../keys/development.keys');
const LivePujaStreaming = require("../../models/puja.live.streaming.model")
const User = require('../../models/user.model')
const constants = require("../../config/constants");
const TemplePuja = require("../../models/temple.puja.model")




exports.createNewLiveStream = async (req, res) => {

    try {

        const { temple_puja_id, temple_id, description, title } = req.body;
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user || user.user_type !== constants.USER_TYPE.USER)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const requestData = {
            playback_policy: ["public"],
            new_asset_settings: {
                playback_policy: "public",
                max_resolution_tier: "1080p",
                generated_subtitles: [
                    {
                        name: "Auto-generated Subtitles",
                        language_code: "en"
                    }
                ]
            }
        };


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

        const playbackIds = response.data.data.playback_ids.map(item => item.id);

        const liveStreamData = {
            description,
            title,
            stream_key: response.data.data.stream_key,
            status: response.data.data.status,
            reconnect_window: response.data.data.reconnect_window,
            max_continuous_duration: response.data.data.max_continuous_duration,
            latency_mode: response.data.data.latency_mode,
            live_stream_id: response.data.data.id,
            playback_id: playbackIds[0],
            created_at: response.data.data.created_at,
            templeId: temple_id,
            temple_puja_id: temple_puja_id,
            userId: userId
        };

        const liveStreamingData = await LivePujaStreaming.create(liveStreamData);

        const responseData = {
            id: liveStreamingData._id,
            description: liveStreamingData.description,
            title: liveStreamingData.title,
            stream_key: liveStreamingData.stream_key,
            playback_id: liveStreamingData.playback_id,
            live_stream_id: liveStreamingData.live_stream_id,
            created_at: liveStreamingData.created_at,
            temple_id: liveStreamingData.templeId,
            status: liveStreamingData.status,
            temple_puja_id: liveStreamData.temple_puja_id,
            user_id: liveStreamData.userId,
            event_type: liveStreamingData.event_type
        };

        return sendResponse(res, WEB_STATUS_CODE.CREATED, STATUS_CODE.SUCCESS, 'LIVESTREAM.create_new_live_stream_video', responseData, req.headers.lang);

    } catch (err) {
        console.error("Error in createNewLiveStream:", err);
        return sendResponse(res, WEB_STATUS_CODE.SERVER_ERROR, STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.getAllLiveStreamByPuja = async (req, res) => {

    try {

        const { limit } = req.query;
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user || user.user_type !== constants.USER_TYPE.USER)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const response = await axios.get(`${MUXURL}/video/v1/live-streams`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
            }
        });

        const LiveStreamingData = response.data.data.map(stream => stream.id);

        const liveStreamData = await LivePujaStreaming.find({
            live_stream_id: { $in: LiveStreamingData }, userId: userId, status: 'active'
        }).limit(parseInt(limit));

        if (!liveStreamData || liveStreamData.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'TEMPLE.Live_stream_not_found', [], req.headers.lang);

        // Format the response data
        const responseData = await Promise.all(liveStreamData.map(async livestream => {
            return {
                playback_id: livestream.playback_id,
                live_stream_id: livestream.live_stream_id,
                stream_key: livestream.stream_key,
                title: livestream.title,
                status: livestream.status,
                temple_puja_id:livestream.temple_puja_id,
                user_id:livestream.userId,
                temple_id:livestream.templeId,
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



