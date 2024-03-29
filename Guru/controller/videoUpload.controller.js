
const { sendResponse } = require('../../services/common.service')
const constants = require("../../config/constants");
const dateFormat = require('../../helper/dateformat.helper');
const TempleGuru = require('../../models/guru.model');
const Video = require('../../models/uploadVideo.model')
const { MUXURL, MUX_TOKEN_ID, MUX_TOKEN_SECRET, BASEURL } = require('../../keys/development.keys');
const axios = require('axios');
const { getViewerCountsToken } = require('../../services/muxSignInKey')




exports.uploadNewVideo = async (req, res) => {

    const guruId = req.guru._id;
    const reqBody = req.body;

    const guru = await TempleGuru.findById(guruId)

    if (!guru)
        return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.FAIL, 'GURU.guru_not_found', {}, req.headers.lang);

    if (guru.user_type !== constants.USER_TYPE.GURU)
        return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.FAIL, 'GENERAL.invalid_user', {}, req.headers.lang);

    const file = req.file.filename;
    let videoUrl = `${'http://16.170.253.177:8001'}/uploads/${file}`

    const requestData = {
        "input": 'https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_20mb.mp4',
        "playback_policy": ["public"],
        "encoding_tier": "smart",
        "max_resolution_tier": "2160p"
    };


    try {

        const response = await axios.post(
            `${MUXURL}/video/v1/assets`,
            requestData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        const ids = response.data.data.playback_ids.map((item) => item.id);
        console.log(ids[0])

        const object = {
            startTime: dateFormat.add_current_time(),
            created_at: dateFormat.set_current_timestamp(),
            updated_at: dateFormat.set_current_timestamp(),
            description: reqBody.description,
            title: reqBody.title,
            comment: reqBody.comment,
            tags: reqBody.tags,
            videoUrl: videoUrl,
            status:reqBody.status,
            guruId: guruId,
            muxData: {
                playBackId: ids[0],
                mp4_support: response.data.mp4_support,
                master_access: response.data.data.master_access,
                encoding_tier: response.data.data.encoding_tier,
                assetId: response.data.data.id,
                created_at: response.data.data.created_at
            },
        }

        const videoData = await Video.create(object)

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'GURU.guru_successfully_upload_new_video', videoData, req.headers.lang);

    } catch (err) {
        console.log("err(uploadNewVideo)....", err)
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.getAllVideo = async (req, res) => {

    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    try {
        // Fetching video data from MUX
        const response = await axios.get(
            `${MUXURL}/video/v1/assets`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );

        if (!response.data || response.data.length === 0)
            return sendResponse(res, WEB_STATUS_CODE.NOT_FOUND, STATUS_CODE.FAIL, 'LIVESTREAM.not_found_streams', {}, req.headers.lang);


        const assetsId = response.data.data.map(assetId => assetId.id);

        const videoData = await Video.find({ 'muxData.assetId': { $in: assetsId } }, { totalViews: 0, totalWatchingTime: 0 })
            .populate('guruId', 'GuruName email mobile_number _id')
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        if (!videoData || videoData.length === 0)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.not_found', {}, req.headers.lang);

        let videos = {
            videoData: videoData,
            muxData: response.data
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_all_videos', videos, req.headers.lang);

    } catch (err) {
        console.log("err(getAllVideo)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};


exports.getVideo = async (req, res) => {

    const { assetId } = req.params;

    try {

        const response = await axios.get(
            `${MUXURL}/video/v1/assets/${assetId}/input-info`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            }
        );


        if (!response.data)
            return sendResponse(res, WEB_STATUS_CODE.NOT_FOUND, STATUS_CODE.FAIL, 'LIVESTREAM.not_found_streams', {}, req.headers.lang);


        const videoData = await Video.findOne({ 'muxData.assetId': assetId })
            .populate('guruId', 'GuruName email mobile_number _id')

        if (!videoData)
            return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.not_found', {}, req.headers.lang);


        videoData.totalViews = undefined;
        videoData.totalWatchingTime = undefined;

        let videos = {
            videoData: videoData,
            muxData: response.data
        }

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_videos', videos, req.headers.lang);

    } catch (err) {
        console.log("err(getVideo)....", err);
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

        const videoData = await Video.findOneAndUpdate({ 'muxData.assetId': assetId });

        if (!videoData) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.SUCCESS, 'GURU.not_found', {}, req.headers.lang);
        }

        const videos = {
            videoData: videoData,
            TotalViews: response.data
        };

        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'GURU.get_total_views', videos, req.headers.lang);

    } catch (err) {
        console.log("err(getCountTotalViews)....", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang);
    }
};
