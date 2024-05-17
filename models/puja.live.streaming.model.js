



const mongoose = require('mongoose')


const LivePujaStreamSchema = new mongoose.Schema({

    templeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'temple',
        default: null
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null
    },
    temple_puja_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'templepujas', 
        default: null
    },
    title: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    stream_key: {
        type: String,
        default: null
    },
    status: {
        type: String,
        default: null
    },
    event_type:{
        type:String,
        default:null
    },
    reconnect_window: {
        type: String,
        default: null
    },
    max_continuous_duration: {
        type: String,
        default: null
    },
    latency_mode: {
        type: String,
        default: null
    },
    playback_id: {
        type: String,
        default: null
    },
    live_stream_id: {
        type: String,
        default: null
    },
    created_at: {
        type: String,
        default: null
    },
})


const LivePujaStreaming = mongoose.model('livepujastreaming', LivePujaStreamSchema);
module.exports = LivePujaStreaming