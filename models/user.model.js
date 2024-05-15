const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const constants = require('../config/constants');
const dateFormat = require('../helper/dateformat.helper');
const { JWT_SECRET } = require('../keys/keys')
const Schema = mongoose.Schema;




const userSchema = new Schema({

    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    full_name: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    mobile_number: {
        type: String,
        default: null
    },
    dob: {
        type: String,
        default: null
    },
    gender: {
        type: String,
        default: null
    },
    profileImg: {
        type: String,
        default: null
    },
    user_type: {
        type: Number,
        default: 2
    },
    verify: {
        type: Boolean,
        default: false
    },
    status: {
        type: Number,
        default: constants.STATUS.ACTIVE
    },
    isUpdated: {
        type: Boolean,
        default: false
    },
    signup_status: {
        type: Number,
        default: 1
    },
    reset_password_token: {
        type: String,
        default: null
    },
    tokens: {
        type: String,
        default: null
    },
    refresh_tokens: {
        type: String,
        default: null
    },
    password: {
        type: String,
        default: null
    },
    otp: {
        type: String,
        default: null
    },
    device_token: {
        type: String,
        default: null
    },
    device_type: {
        type: Number,
        default: null
    },
    created_at: {
        type: String,
    },
    updated_at: {
        type: String,
    },
    deleted_at: {
        type: String,
        default: null,
    },
});



userSchema.index({ "email": 1 });

userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};


userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};


userSchema.statics.findByCredentials = async function (email, password, user_type) {
    const user = await this.findOne({
        $or: [{ email: email }, { user_name: email }],
        user_type: user_type,
        deleted_at: null
    });

    if (!user) return null;
    if (!user.validPassword(password)) return null;

    return user;
}


userSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign({ _id: this._id.toString() }, JWT_SECRET, { expiresIn: 60 * 60 * 24 * 2 });
    this.tokens = token;
    this.updated_at = await dateFormat.set_current_timestamp();
    await this.save();
    return token;
};


userSchema.methods.generateRefreshToken = async function () {
    const refresh_token = jwt.sign({ _id: this._id.toString() }, JWT_SECRET, { expiresIn: 7 * 24 * 60 * 60 });
    this.refresh_tokens = refresh_token;
    this.updated_at = await dateFormat.set_current_timestamp();
    await this.save();
    return refresh_token;
};



const User = mongoose.model('users', userSchema);
module.exports = User;