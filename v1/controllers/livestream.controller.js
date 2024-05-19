const axios = require('axios');
const dateFormat = require('../../helper/dateformat.helper');
const { sendResponse } = require("../../services/common.service");
const { WEB_STATUS_CODE, STATUS_CODE } = require('../../config/constants');
const { MUX_TOKEN_ID, MUX_TOKEN_SECRET, MUXURL } = require('../../keys/development.keys');
const LivePujaStreaming = require("../../models/puja.live.streaming.model")
const User = require('../../models/user.model')
const constants = require("../../config/constants");
const TemplePuja = require("../../models/temple.puja.model")
const Temple = require('../../models/temple.model')
const Booking = require('../../models/Booking.model')





exports.createNewLiveStream = async (req, res) => {

    try {

        const templeId = req.temple._id;
        const { booking_id , title , description } = req.body;
        const user = await Temple.findById(templeId);

        if (!user || user.user_type !== constants.USER_TYPE.TEMPLE)
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
            bookingId: booking_id
        };

        const bookingData = await Booking.findById(booking_id);
        bookingData.is_live_streaming = true;
        bookingData.streaming_key = response.data.data.stream_key;
        bookingData.play_back_id = playbackIds[0];
        bookingData.live_streaming_id = response.data.data.id;
        await bookingData.save();

        const liveStreamingData = await LivePujaStreaming.create(liveStreamData);

        const responseData = {
            id: liveStreamingData._id,
            description: liveStreamingData.description,
            title: liveStreamingData.title,
            stream_key: liveStreamingData.stream_key,
            playback_id: liveStreamingData.playback_id,
            live_stream_id: liveStreamingData.live_stream_id,
            created_at: liveStreamingData.created_at,
            live_streaming_status: liveStreamingData.status,
            event_type: liveStreamingData.event_type,
            user_id: bookingData.userId,
            temple_puja_id: bookingData.TemplepujaId,
            temple_id: bookingData.templeId,
            slot_id: bookingData.slotId,
            is_live_streaming: bookingData.is_live_streaming,
            is_complete: bookingData.is_complete,
            booking_status: bookingData.status,
        };

        return sendResponse(res, WEB_STATUS_CODE.CREATED, STATUS_CODE.SUCCESS, 'LIVESTREAM.create_new_live_stream_video', responseData, req.headers.lang);

    } catch (err) {
        console.error("Error in createNewLiveStream:", err);
        return sendResponse(res, WEB_STATUS_CODE.SERVER_ERROR, STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};





