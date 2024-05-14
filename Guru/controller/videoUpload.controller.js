
const { sendResponse } = require('../../services/common.service')
const constants = require("../../config/constants");
const dateFormat = require('../../helper/dateformat.helper');
const Temple = require('../../models/temple.model');
const Guru = require('../../models/guru.model');
const Video = require('../../models/uploadVideo.model')
const { MUXURL, MUX_TOKEN_ID, MUX_TOKEN_SECRET, BASEURL } = require('../../keys/development.keys');
const axios = require('axios');
const { getViewerCountsToken } = require('../../services/muxSignInKey');






exports.videoAddByTemple = async (req, res) => {

    try {

        const templeId = req.temple._id;
        const reqBody = req.body;

        const temple = await Temple.findById(templeId);

        if (!temple || temple.user_type !== constants.USER_TYPE.TEMPLE)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        if(!req.file)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'VIDEO.no_video_upload', {}, req.headers.lang);

        const file = req.file;
         const videoUrl = `${BASEURL}/uploads/${file.filename}`;

        const requestData = {
            "input": videoUrl,
            "playback_policy": ["public"],
            "encoding_tier": "smart",
            "max_resolution_tier": "2160p"
        };

        const response = await axios.post(
            `${MUXURL}/video/v1/assets`,
            requestData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );


        const videoObject = {
            created_at: dateFormat.set_current_timestamp(),
            updated_at: dateFormat.set_current_timestamp(),
            description: reqBody.description,
            title: reqBody.title,
            videoUrl: videoUrl,
            templeId: templeId,
            playback_id: response.data.data.playback_ids[0].id,
            mp4_support: response.data.mp4_support,
            master_access: response.data.data.master_access,
            encoding_tier: response.data.data.encoding_tier,
            asset_id: response.data.data.id,
            created_at: response.data.data.created_at
        };

        const videoData = await Video.create(videoObject);
        const responseData = {
            video_id: videoData._id,
            title: videoData.title,
            description:videoData.description,
            video_url:videoData.videoUrl,
            asset_id:videoData.asset_id,
            playback_id:videoData.playback_id,
            templeId:videoData.templeId

        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'VIDEO.add_new_video', responseData , req.headers.lang);

    } catch (err) {
        console.log("Error(videoAddByTemple)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}



exports.videoAddByGuru = async (req, res) => {

    try {

        const guruId = req.guru._id;
        const reqBody = req.body;

        const guru = await Guru.findById(guruId);

        if (!guru || guru.user_type !== constants.USER_TYPE.GURU)
            return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        if(!req.file)
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'VIDEO.no_video_upload', {}, req.headers.lang);

        const file = req.file;
         const videoUrl = `${BASEURL}/uploads/${file.filename}`;

        const requestData = {
            "input": videoUrl,
            "playback_policy": ["public"],
            "encoding_tier": "smart",
            "max_resolution_tier": "2160p"
        };

        const response = await axios.post(
            `${MUXURL}/video/v1/assets`,
            requestData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        const muxData = {
            playback_id: response.data.data.playback_ids[0].id,
            mp4_support: response.data.mp4_support,
            master_access: response.data.data.master_access,
            encoding_tier: response.data.data.encoding_tier,
            asset_id: response.data.data.id,
            created_at: response.data.data.created_at
        };

        const videoObject = {
            created_at: dateFormat.set_current_timestamp(),
            updated_at: dateFormat.set_current_timestamp(),
            description: reqBody.description,
            title: reqBody.title,
            videoUrl: videoUrl,
            guruId: guruId,
            muxData: muxData
        };

        const videoData = await Video.create(videoObject);

        const responseData = {
            video_id: videoData._id,
            title: videoData.title,
            description:videoData.description,
            video_url:videoData.videoUrl,
            asset_id:videoData.muxData.asset_id,
            playback_id:videoData.muxData.playback_id,
            guruId:videoData.guruId
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'VIDEO.add_new_video', responseData , req.headers.lang);

    } catch (err) {
        console.log("Error(videoAddByGuru)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
}



exports.getAllVideo = async (req, res) => {

    const { sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    try {

        const response = await axios.get(
            `${MUXURL}/video/v1/assets`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        if (!response.data || !response.data.data || response.data.data.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'LIVESTREAM.not_found_streams', [], req.headers.lang);

        const assetsId = response.data.data.map(asset => asset.id);

        const videoData = await Video.find({ 'muxData.asset_id': { $in: assetsId } })
            .sort({ [sortBy]: sortOrder })
            .populate([
                { path: 'guruId', select: ' _id' },
                { path: 'guruId', select: '_id' }
            ]);

        const matchedData = response.data.data.filter(user => {
            return videoData.some(muxData => muxData.muxData.asset_id === user.id);
        });

        if (!videoData || videoData.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'GURU.not_found', {}, req.headers.lang);


        const responseData = videoData.map(video => ({
            plackback_id: video.muxData.playback_id,
            asset_id: video.muxData.asset_id,
            description: video.description,
            title: video.title,
            video_url: video.videoUrl,
            id: video._id,
            duration: video.duration,
            views: video.views,
            duration: matchedData[0].duration,
            temple_or_guru_id: video.guruId
        }))

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_all_videos', responseData, req.headers.lang);

    } catch (err) {
        console.log("Error in getAllVideo:", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};



exports.getCountTotalViews = async (req, res) => {

    try {

        const { assetId } = req.query;

        const token = await getViewerCountsToken(assetId);

        const response = await axios.get(`https://stats.mux.com/counts?token=${token}`);

        if (!response.data) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.SUCCESS, 'GURU.not_found', {}, req.headers.lang);
        }

        const videoData = await Video.findOneAndUpdate({ 'muxData.asse_id': assetId });

        if (!videoData) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.SUCCESS, 'GURU.not_found', {}, req.headers.lang);
        }

        const { views, viewers } = response.data.data[0];
        videoData.views = views;
        await videoData.save();

        const videos = {

            plackback_id: videoData.muxData.playback_id,
            asset_id: videoData.muxData.asset_id,
            title: videoData.title,
            description: videoData.description,
            video_url: videoData.videoUrl,
            views: views,
            viewers: viewers
        } || {}

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_total_views', videos, req.headers.lang);

    } catch (err) {
        console.log("err(getCountTotalViews)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};
