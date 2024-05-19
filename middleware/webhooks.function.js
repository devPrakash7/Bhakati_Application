
// services/liveStreamingService.js

const LiveStreaming = require('../models/live.streaming.model');
const Video = require("../models/uploadVideo.model");
const LivePujaStreaming = require("../models/puja.live.streaming.model");
const Booking = require('../models/Booking.model')



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


const updatePujaLiveStreamingStatus = async (liveStreamId, status, eventType) => {

  try {

    const liveStreamingData = await LivePujaStreaming.findOneAndUpdate(
      { live_stream_id: liveStreamId },
      { $set: { status, event_type: eventType } },
      { new: true }
    );

    if (liveStreamingData.status === "idle") {
        await Booking.findOneAndUpdate({ bookingId: liveStreamingData.bookingId }, {
        $set: {
          is_live_streaming: false,
          is_complete: true
        }
      }, { new: true })
    }

    return liveStreamingData;

  } catch (err) {
    console.error("Error updating live streaming status:", err.message);
    throw err;
  }
};

module.exports = { updateLiveStreamingStatus, updateVideoStatus, updatePujaLiveStreamingStatus };
