
// services/liveStreamingService.js

const LiveStreaming = require('../models/live.streaming.model');
const Video = require("../models/uploadVideo.model");



const updateVideoStatus = async (assetId, status, eventType) => {
  try {
    const videoData = await Video.findOneAndUpdate(
      { asset_id: assetId },
      { $set: { status, event_type: eventType } },
      { new: true }
    );
    return videoData;
  } catch (err) {
    console.error("Error updating video status:", err.message);
    throw err;
  }
};


const updateLiveStreamingStatus = async (liveStreamId, status, eventType) => {

  try {

    const liveStreamingData = await LiveStreaming.findOneAndUpdate(
      { live_stream_id: liveStreamId },
      { $set: { status, event_type: eventType } },
      { new: true }
    );
    return liveStreamingData;

  } catch (err) {
    console.error("Error updating live streaming status:", err.message);
    throw err;
  }
};

module.exports = { updateLiveStreamingStatus , updateVideoStatus };
