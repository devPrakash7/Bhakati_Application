

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const dateFormat = require('../helper/dateformat.helper');
const {
    JWT_SECRET
} = require('../keys/keys')




// Define schema for temple guru
const templeSchema = new mongoose.Schema({

    mobile_number: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    password: {
        type: String,
        default: null
    },
    user_type: {
        type: Number,
        default: 3
    },
    status: {
        type: String,
        default: 'active'
    },
    is_verify: {
        type: Boolean,
        default: true
    },
    tokens: {
        type: String,
        default: null,
    },
    refresh_tokens: {
        type: String,
        default: null,
    },
    temple_name: {
        type: String,
        default: null
    },
    temple_image: {
        type: String,
        default: null
    },
    background_image: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    country: {
        type: String,
        default: "india"
    },
    location: {
        type: String,
        default: null
    },
    district: {
        type: String,
        default: null
    },
    state: {
        type: String
    },
    puja_list: [{
        type: String
    }],
    contact_person_name: {
        type: String
    },
    contact_person_designation: {
        type: String
    },
    opening_time: {
        type: String,
        default: null
    },
    closing_time: {
        type: String,
        default: null
    },
    category: {
        type: String
    },
    live_streaming: {
        type: Boolean,
        default: false
    },
    enable: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: String
    },
    updated_at: {
        type: String
    },
    deleted_at: {
        type: String,
        default: null
    }
});




templeSchema.methods.toJSON = function () {
    const temple = this.toObject();
    return temple;
};


templeSchema.statics.findByCredentials = async function (email, password) {
    const temple = await this.findOne({
        email: email,
        password: password,
        deleted_at: null
    });

    if (!temple) {
        return null;
    }

    return temple;
};


templeSchema.methods.generateAuthToken = async function () {
    const temple = this;
    const token = jwt.sign({ _id: temple._id.toString() }, JWT_SECRET, { expiresIn: 60 * 60 * 24 * 2 });
    temple.tokens = token;
    temple.updated_at = await dateFormat.set_current_timestamp();
    await temple.save();
    return token;
};


templeSchema.methods.generateRefreshToken = async function () {
    const temple = this;
    const refreshToken = jwt.sign({ _id: temple._id.toString() }, JWT_SECRET, { expiresIn: 7 * 24 * 60 * 60 });
    temple.refresh_tokens = refreshToken;
    temple.updated_at = await dateFormat.set_current_timestamp();
    await temple.save();
    return refreshToken;
};


const Temple = mongoose.model('temple', templeSchema);
module.exports = Temple;