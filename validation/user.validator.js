
const { body, validationResult, param, oneOf } = require('express-validator');





exports.create_new_user_validator = [

    body('full_name')
        .not()
        .isEmpty()
        .withMessage('full_name is required')
        .isString().withMessage('full_name should be a string')
        .trim(),

    body('email')
        .not()
        .isEmpty()
        .withMessage('email is required')
        .isString().withMessage('email should be a string')
        .isEmail().withMessage('please enter a valid email')
        .trim(),

    body('password')
        .not()
        .isEmpty()
        .withMessage('password is required')
        .isString().withMessage('password should be a string')
        .isLength({ min: 8 }).withMessage('password length must be 8 characters')
        .trim(),

    body('mobile_number')
        .not()
        .isEmpty()
        .withMessage('mobile_number is required')
        .isString().withMessage('mobile_number should be a string')
        .isMobilePhone().withMessage('please enter a valid mobile number')
        .trim(),
];


exports.login_validator = [

    body('email')
        .not()
        .isEmpty()
        .withMessage('email is required')
        .isString().withMessage('email should be a string')
        .isEmail().withMessage('please enter a valid email')
        .trim()
];

const validGender = ['male', 'female', 'other']

exports.update_validator = [

    param('userId')
        .not()
        .isEmpty()
        .withMessage('userId is required')
        .isString().withMessage('userId should be a string')
        .isMongoId().withMessage('please enter a valid userId ')
        .trim(),

    body('full_name')
        .not()
        .isEmpty()
        .withMessage('full_name is required')
        .isString().withMessage('full_name should be a string')
        .trim(),

    body('gender')
        .not()
        .isEmpty()
        .withMessage('gender is required')
        .isString().withMessage('gender should be a string')
        .isIn(validGender).withMessage('please enter a valid gender')
        .isLowercase().withMessage('gender should be lowercase')
        .trim(),

    body('dob')
        .not()
        .isEmpty()
        .withMessage('dob is required')
        .isString().withMessage('dob should be a string')
        .trim(),


    body('mobile_number')
        .not()
        .isEmpty()
        .withMessage('mobile_number is required')
        .isString().withMessage('mobile_number should be a string')
        .isMobilePhone().withMessage('please enter a valid mobile_number')
        .isLength({ min: 10, max: 12 })
        .trim(),

    body('address')
        .not()
        .isEmpty()
        .withMessage('address is required')
        .isString().withMessage('address should be a string')
        .trim(),
]


exports.verify_otp_validator = [

    param('userId')
        .not()
        .isEmpty()
        .withMessage('userId is required')
        .isString().withMessage('userId should be a string')
        .isMongoId().withMessage('please enter a valid userId ')
        .trim(),

    body('otp')
        .not()
        .isEmpty()
        .withMessage('otp is required')
        .isString().withMessage('otp should be a string')
        .isLength({ min: 6, max: 6 }).withMessage('otp length must be 6 characters')
        .trim()
];


exports.upload_profile_image_validator = [

    body('profile_image')
        .not()
        .isEmpty()
        .withMessage('profile_image is required')
        .isString().withMessage('profile_image should be a string')
        .trim()
]

exports.device_token_validator = [

    body('device_token')
        .not()
        .isEmpty()
        .withMessage('device_token is required')
        .isString().withMessage('device_token should be a string')
        .trim()
]

exports.new_token_validator = [

    body('refresh_tokens')
        .not()
        .isEmpty()
        .withMessage('refresh_tokens is required')
        .isString().withMessage('refresh_tokens should be a string')
        .trim()
]



exports.ValidatorResult = (req, res, next) => {

    try {

        const result = validationResult(req);
        const haserror = !result.isEmpty();

        if (haserror) {
            const err = result.array()[0].msg;
            return res.status(400).send({ sucess: false, message: err });
        }
        next();

    } catch (err) {

        res.status(false).send({ status: false, message: err.message })
    }
}