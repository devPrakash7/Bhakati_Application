
const { body, validationResult, param, query, oneOf } = require('express-validator');


exports.add_guru_validator = [

    body('guru_name')
        .not()
        .isEmpty()
        .withMessage('guru_name is required')
        .isString().withMessage('guru_name should be a string')
        .trim(),

    body('email')
        .not()
        .isEmpty()
        .withMessage('email is required')
        .isString().withMessage('email should be a string')
        .isEmail().withMessage('please enter a valid email address')
        .trim(),

    body('password')
        .not()
        .isEmpty()
        .withMessage('password is required')
        .isString().withMessage('password should be a string')
        .isLength({ min: 8 }).withMessage('password length should be 8 characters')
        .trim(),

    body('mobile_number')
        .not()
        .isEmpty()
        .withMessage('mobile_number is required')
        .isString().withMessage('mobile_number should be a string')
        .isMobilePhone().withMessage('please enter a valid mobile_number')
        .isLength({ min: 10, max: 12 }).withMessage('mobile_number length must be 10 digit')
        .trim(),

    body('expertise')
        .not()
        .isEmpty()
        .withMessage('expertise is required')
        .isString().withMessage('expertise should be a string')
        .trim(),

    body('description')
        .not()
        .isEmpty()
        .withMessage('description is required')
        .isString().withMessage('description should be a string')
        .trim(),

        body('location')
        .not()
        .isEmpty()
        .withMessage('location is required')
        .isString().withMessage('location should be a string')
        .trim(),

        body('state')
        .not()
        .isEmpty()
        .withMessage('state is required')
        .isString().withMessage('state should be a string')
        .trim(),

        body('district')
        .not()
        .isEmpty()
        .withMessage('district is required')
        .isString().withMessage('district should be a string')
        .trim(),

];


exports.login_validator = [

    body('email')
        .not()
        .isEmpty()
        .withMessage('email is required')
        .isString().withMessage('email should be a string')
        .isEmail().withMessage('please enter a valid email address')
        .trim(),

    body('password')
        .not()
        .isEmpty()
        .withMessage('password is required')
        .isString().withMessage('password should be a string')
        .isLength({ min: 8 }).withMessage('password length should be 8 characters')
        .trim(),

]

exports.upload_image_validator = [

    param('guruId')
        .not()
        .isEmpty()
        .withMessage('guruId is required')
        .isString().withMessage('guruId should be a string')
        .isMongoId().withMessage('please enter a valid guruId')
        .isLength({ min: 24 }).withMessage('guruId length must be 24')
        .trim(),
]

exports.get_guru_profile_admin_validator = [

    param('guruId')
        .not()
        .isEmpty()
        .withMessage('guruId is required')
        .isString().withMessage('guruId should be a string')
        .isMongoId().withMessage('please enter a valid guruId')
        .isLength({ min: 24 }).withMessage('guruId length must be 24')
        .trim(),

]

exports.guru_suggested_video_validator = [

    query('guruId')
        .not()
        .isEmpty()
        .withMessage('guruId is required')
        .isString().withMessage('guruId should be a string')
        .isMongoId().withMessage('please enter a valid guruId')
        .isLength({ min: 24 }).withMessage('guruId length must be 24')
        .trim(),

]


exports.create_live_validator = [

    body('title')
        .not()
        .isEmpty()
        .withMessage('title is required')
        .isString().withMessage('title should be a string')
        .trim(),

    body('description')
        .not()
        .isEmpty()
        .withMessage('description is required')
        .isString().withMessage('description should be a string')
        .trim()
]

exports.update_guru_validator = [

    oneOf([

        body('guru_name')
            .not()
            .isEmpty()
            .withMessage('guru_name is required')
            .isString().withMessage('guru_name should be a string')
            .trim(),

        body('email')
            .not()
            .isEmpty()
            .withMessage('email is required')
            .isString().withMessage('email should be a string')
            .isEmail().withMessage('please enter a valid email address')
            .trim(),

        body('password')
            .not()
            .isEmpty()
            .withMessage('password is required')
            .isString().withMessage('password should be a string')
            .isLength({ min: 8 }).withMessage('password length should be 8 characters')
            .trim(),

        body('mobile_number')
            .not()
            .isEmpty()
            .withMessage('mobile_number is required')
            .isString().withMessage('mobile_number should be a string')
            .isMobilePhone().withMessage('please enter a valid mobile_number')
            .isLength({ min: 10, max: 12 }).withMessage('mobile_number length must be 10 digit')
            .trim(),

        body('expertise')
            .not()
            .isEmpty()
            .withMessage('expertise is required')
            .isString().withMessage('expertise should be a string')
            .trim(),

        body('description')
            .not()
            .isEmpty()
            .withMessage('description is required')
            .isString().withMessage('description should be a string')
            .trim(),

        body('adharacard')
            .not()
            .isEmpty()
            .withMessage('adharacard is required')
            .isNumeric().withMessage('adharacard should be a string')
            .isLength({ min: 12, max: 12 }).withMessage('adharacard length should be 12')
            .trim()
    ],
        {
            message: 'please enter valid key',
        }),
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