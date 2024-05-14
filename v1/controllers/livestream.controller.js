const axios = require('axios');
const LiveStream = require('../../models/liveStreaming.model');
const dateFormat = require('../../helper/dateformat.helper');
const { sendResponse } = require("../../services/common.service");
const { WEB_STATUS_CODE, STATUS_CODE } = require('../../config/constants');
const { MUX_TOKEN_ID, MUX_TOKEN_SECRET, MUXURL } = require('../../keys/development.keys');
const { LiveStreamingResponse } = require('../../ResponseData/LiveStream.reponse');
const Puja = require('../../models/puja.model');
const Rithuls = require('../../models/Rituals.model')
const constants = require('../../config/constants')





exports.createNewLiveStream = async (req, res) => {

    try {

        const { pujaId, templeId, description, title } = req.body;

        const requestData = {
            "playback_policy": ["public"],
            "new_asset_settings": {
                "playback_policy": "public",
                "max_resolution_tier": "1080p",
                "generated_subtitles": [{
                    "name": "Auto-generated Subtitles",
                    "language_code": "en"
                }]
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

        const { data } = response.data;
        const ids = data.playback_ids.map(item => item.id);

        const newLiveStream = {
            pujaId,
            templeId,
            status: 'LIVE',
            startTime: dateFormat.add_current_time(),
            created_at: dateFormat.set_current_timestamp(),
            updated_at: dateFormat.set_current_timestamp(),
            description,
            title,
            muxData: {
                playBackId: ids[0],
                stream_key: data.stream_key,
                status: data.status,
                reconnect_window: data.reconnect_window,
                max_continuous_duration: data.max_continuous_duration,
                latency_mode: data.latency_mode,
                LiveStreamingId: data.id,
                created_at: data.created_at,
            },
        };

        const addedLiveStream = await LiveStream.create(newLiveStream);
        const responseData = LiveStreamingResponse(addedLiveStream);

        return sendResponse(res, WEB_STATUS_CODE.CREATED, STATUS_CODE.SUCCESS, 'LIVESTREAM.create_new_live_stream_video', responseData, req.headers.lang);
    } catch (err) {
        console.error("Error in createNewLiveStream:", err);
        return sendResponse(res, WEB_STATUS_CODE.SERVER_ERROR, STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};





exports.getAllLiveStreamByPuja = async (req, res) => {

    const { limit = 25, page = 1 } = req.query;

    try {
        // Fetch live streams from MUX API
        const response = await axios.get(
            `${MUXURL}/video/v1/live-streams`,
            {
                params: {
                    limit,
                    offset: (page - 1) * limit
                },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        // Check if live streams are not found
        if (!response.data || response.data.length === 0) {
            return sendResponse(res, WEB_STATUS_CODE.OK, STATUS_CODE.SUCCESS, 'LIVESTREAM.not_found_streams', [], req.headers.lang);
        }


        const query = {};
        query.pujaId = { $ne: null };

        // Fetch live streams data from database
        const LiveStreamsData = await LiveStream.find(query)
            .select('_id status startTime muxData.stream_key muxData.LiveStreamingId muxData.playBackId title description')
            .populate('templeId', 'TempleName TempleImg Location State District Desc Temple_Open_time Closing_time _id templeId user_type')
            .populate('pujaId', 'pujaName pujaImage _id')
            .sort({ startTime: -1 }) // Sort by startTime in descending order
            .limit(parseInt(limit))
            .skip((page - 1) * limit);

        // Check if live streams data is not found
        if (!LiveStreamsData || LiveStreamsData.length === 0) {
            return sendResponse(res, WEB_STATUS_CODE.OK, STATUS_CODE.SUCCESS, 'LIVESTREAM.not_found', [], req.headers.lang);
        }

        const LiveStreamingData =  LiveStreamsData.map(stream => stream.muxData.LiveStreamingId);
        const streamingData = [];
        for (const item of response.data.data) {
          if (LiveStreamingData.includes(item.id)) {
            streamingData.push(item);
          }
        }

        // Combine MUX data and live streams data
        const allLivestreams = {
            LiveStreamsData,
            streamingData
        };


        // Send response
        return sendResponse(res, WEB_STATUS_CODE.OK, STATUS_CODE.SUCCESS, 'LIVESTREAM.get_all_live_streams_by_puja', allLivestreams, req.headers.lang);
    } catch (err) {
        console.error("Error in getAllLiveStreamByPuja:", err);
        return sendResponse(res, WEB_STATUS_CODE.SERVER_ERROR, STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};




exports.deleteLiveStream = async (req, res) => {
    const { LIVE_STREAM_ID, id } = req.params;

    try {
        // Delete live stream from MUX API
        const response = await axios.delete(
            `${MUXURL}/video/v1/live-streams/${LIVE_STREAM_ID}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        // Check if live stream is not found
        if (!response.data) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'LIVESTREAM.not_found_streams', {}, req.headers.lang);
        }

        // Delete live stream from database
        const livestream = await LiveStream.findOneAndDelete({ _id: id });

        // Check if live stream is not found
        if (!livestream) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'LIVESTREAM.not_found', {}, req.headers.lang);
        }

        // Send success response
        const livestreams = LiveStreamingResponse(livestream);
        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'LIVESTREAM.delete_live_streams', livestreams, req.headers.lang);

    } catch (err) {
        console.error("Error in deleteLiveStream:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};




exports.LiveStreamingEnd = async (req, res) => {

    const { LIVE_STREAM_ID, id } = req.params;
    const reqBody = req.body;

    try {
        // Complete live stream in MUX API
        const response = await axios.put(
            `${MUXURL}/video/v1/live-streams/${LIVE_STREAM_ID}/complete`,
            reqBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );


        // Update live stream status in database
        const endLiveStream = await LiveStream.findOneAndUpdate(
            { _id: id },
            { $set: { status: 'END', endTime: dateFormat.add_current_time(), updated_at: dateFormat.set_current_timestamp() } },
            { new: true }
        );

        // Send success response
        const endLiveStreams = LiveStreamingResponse(endLiveStream);
        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'LIVESTREAM.update_live_streams', endLiveStreams, req.headers.lang);

    } catch (err) {
        console.error("Error in LiveStreamingEnd:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};

