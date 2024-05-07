

const { body, validationResult, param, query, oneOf } = require('express-validator');




exports.signup_validator = [

    body('temple_name')
        .not()
        .isEmpty()
        .withMessage('temple name is required')
        .isString().withMessage('temple name should be a string')
        .isLength({ min: 2, max: 25 })
        .trim(),

    body('email')
        .not()
        .isEmpty()
        .withMessage('email is required')
        .isString().withMessage('email should be a string')
        .isEmail().withMessage('please enter a valid email')
        .isLowercase().withMessage('email should be lowercase')
        .trim(),

    body('mobile_number')
        .not()
        .isEmpty()
        .withMessage('mobile_number is required')
        .isString().withMessage('mobile_number should be a string')
        .isMobilePhone().withMessage('please enter a valid mobile_number')
        .isLength({ min: 10, max: 12 }).withMessage('mobile_number length should be 10')
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
        .isLength({ min: 8 }).withMessage('password length should be 8')
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

    body('contact_person_name')
        .not()
        .isEmpty()
        .withMessage('contact_person_name is required')
        .isString().withMessage('contact_person_name should be a string')
        .trim(),

    body('contact_person_designation')
        .not()
        .isEmpty()
        .withMessage('contact_person_designation is required')
        .isString().withMessage('contact_person_designation should be a string')
        .trim(),
];


exports.temple_login_validator = [

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
        .isLength({ min: 8 }).withMessage('password length should be 8')
        .trim(),
]


exports.temple_upload_image_validator = [

    param('templeId')
        .not()
        .isEmpty()
        .withMessage('templeId is required')
        .isString().withMessage('templeId should be a string')
        .isMongoId().withMessage('please enter a valid templeId')
        .trim(),
]

exports.delete_temple_validator = [

    query('temple_id')
        .not()
        .isEmpty()
        .withMessage('temple_id is required')
        .isString().withMessage('temple_id should be a string')
        .isMongoId().withMessage('please enter a valid temple_id')
        .trim(),
]

exports.get_profile_temple_validator = [

    body('templeId')
        .not()
        .isEmpty()
        .withMessage('temple_id is required')
        .isString().withMessage('temple_id should be a string')
        .isMongoId().withMessage('please enter a valid temple_id')
        .trim(),
]

exports.update_temple_profile_validator = [

    oneOf([
        body('temple_name')
            .not()
            .isEmpty()
            .withMessage('temple name is required')
            .isString().withMessage('temple name should be a string')
            .isLength({ min: 2, max: 25 })
            .trim(),

        body('email')
            .not()
            .isEmpty()
            .withMessage('email is required')
            .isString().withMessage('email should be a string')
            .isEmail().withMessage('please enter a valid email')
            .isLowercase().withMessage('email should be lowercase')
            .trim(),

        body('mobile_number')
            .not()
            .isEmpty()
            .withMessage('mobile_number is required')
            .isString().withMessage('mobile_number should be a string')
            .isMobilePhone().withMessage('please enter a valid mobile_number')
            .isLength({ min: 10, max: 12 }).withMessage('mobile_number length should be 10')
            .trim(),

        body('email')
            .not()
            .isEmpty()
            .withMessage('email is required')
            .isString().withMessage('email should be a string')
            .isEmail().withMessage('please enter a valid email')
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

        body('contact_person_name')
            .not()
            .isEmpty()
            .withMessage('contact_person_name is required')
            .isString().withMessage('contact_person_name should be a string')
            .trim(),

        body('contact_person_designation')
            .not()
            .isEmpty()
            .withMessage('contact_person_designation is required')
            .isString().withMessage('contact_person_designation should be a string')
            .trim(),

        body('opening_time')
            .not()
            .isEmpty()
            .withMessage('opening_time is required')
            .isString().withMessage('opening_time should be a string')
            .trim(),

        body('closing_time')
            .not()
            .isEmpty()
            .withMessage('closing_time is required')
            .isString().withMessage('closing_time should be a string')
            .trim(),
    ],
        {
            message: 'please update whole key or single ',
        }),
]


exports.create_live_streaming_validator = [

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
        .trim(),
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