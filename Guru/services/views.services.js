const axios = require('axios')
const { getViewerCountsToken } = require('../../services/muxSignInKey')
const crypto = require('crypto');
const { MUX_TOKEN_ID, MUX_TOKEN_SECRET } = require('../../keys/development.keys')



exports.getData = async (assetId) => {

    try {
        const token = await getViewerCountsToken(assetId);
        const response = await axios.get(`https://stats.mux.com/counts?token=${token}`);
        return response.data; // Assuming you want to return the response data

    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error for handling elsewhere
    }
};

exports.minutesToSeconds = (seconds) => {
     const minutes = seconds / 60;
     return minutes;
}


exports.verifyWebhookSignature = (payload, timestamp, secret) => {


    const payloadString = JSON.stringify(payload);
    const data = timestamp + '.' + payloadString;

    let signature = crypto.createHmac('sha256', secret)
        .update(data)
        .digest('hex');

    console.log('Payload:', payloadString);
    console.log('Timestamp:', timestamp);
    console.log('Signature:', signature);

    return signature

}


exports.getLiveStreamInfo = async (streamId) => {

    try {
        const authHeader = `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`;
        const response = await axios.get(`https://api.mux.com/video/v1/live-streams/${streamId}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: authHeader,
            },
        });
        console.log("111", response.data)
        return response.data;
    } catch (error) {
        console.error('Error fetching live stream info:', error.response.data);
        throw new Error('Failed to fetch live stream info');
    }
}

exports.handleActiveLiveStream = async (payload) => {

    console.log('Handling active live stream event:');
    console.log('Stream ID:', payload.data.stream_id);
    console.log('Status:', payload.data.status);
    console.log('Duration:', payload.data.duration);

    if (payload.data.stream_id === 'MySpecialTVLiveStreamID') {
        revalidatePath('/tv');
    }

    return {
        success: true,
        message: 'Active live stream event handled successfully'
    };
}
