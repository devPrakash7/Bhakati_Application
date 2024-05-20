
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const dateFormat = require('../helper/dateformat.helper');
const {
    JWT_SECRET
} = require('../keys/keys')




// Define schema for temple guru
const guruSchema = new mongoose.Schema({

    guru_name: {
        type: String,
        default: null
    },
    guru_image: {
        type: String,
        default: null
    },
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
        default: 4
    },
    expertise: {
        type: String,
        default: null
    },
    enable: {
        type: Boolean,
        default: false
    },
    background_image: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    adharacard: {
        type: Number,
        default:null
    },
    status: {
        type: String,
        default: 'active'
    },
    is_verify: {
        type: Boolean,
        default: false
    },
    location: {
        type: String
    },
    state: {
        type: String
    },
    district: {
        type: String
    },
    tokens: {
        type: String,
        default: null,
    },
    refresh_tokens: {
        type: String,
        default: null,
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




guruSchema.methods.toJSON = function () {
    const guru = this.toObject();
    return guru;
};


guruSchema.statics.findByCredentials = async function (email, password) {
    const guru = await this.findOne({
        email: email,
        password: password,
        deleted_at: null
    });

    if (!guru) {
        return null;
    }

    return guru;
};


guruSchema.methods.generateAuthToken = async function () {
    const guru = this;
    const token = jwt.sign({ _id: guru._id.toString() }, JWT_SECRET, { expiresIn: 60 * 60 * 24 * 2 });
    guru.tokens = token;
    guru.updated_at = await dateFormat.set_current_timestamp();
    await guru.save();
    return token;
};


guruSchema.methods.generateRefreshToken = async function () {
    const guru = this;
    const refreshToken = jwt.sign({ _id: guru._id.toString() }, JWT_SECRET, { expiresIn: 7 * 24 * 60 * 60 });
    guru.refresh_tokens = refreshToken;
    guru.updated_at = await dateFormat.set_current_timestamp();
    await guru.save();
    return refreshToken;
};


const Guru = mongoose.model('Guru', guruSchema);
module.exports = Guru;