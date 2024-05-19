
const { body, validationResult, param } = require('express-validator');



exports.create_liveStream_validator = [

    body('description')
        .not()
        .isEmpty()
        .withMessage('description is required')
        .isString().withMessage('description should be a string')
        .trim(),

    body('title')
        .not()
        .isEmpty()
        .withMessage('title is required')
        .isString().withMessage('title should be a string')
        .trim(),

    body('booking_id')
        .not()
        .isEmpty()
        .withMessage('booking_id is required')
        .isString().withMessage('booking_id should be a string')
        .isMongoId()
        .withMessage('please enter a valid booking_id')
        .trim(),
];



exports.createNewLiveStreamByRithuls_validator = [

    body('description')
        .not()
        .isEmpty()
        .withMessage('description is required')
        .isString().withMessage('description should be a string')
        .trim(),

    body('title')
        .not()
        .isEmpty()
        .withMessage('title is required')
        .isString().withMessage('title should be a string')
        .trim(),

    body('templeId')
        .not()
        .isEmpty()
        .withMessage('templeId is required')
        .isString().withMessage('templeId should be a string')
        .isMongoId()
        .withMessage('please enter a valid templeId')
        .trim(),

    body('ritualId')
        .not()
        .isEmpty()
        .withMessage('ritualId is required')
        .isString().withMessage('ritualId should be a string')
        .isMongoId()
        .withMessage('please enter a valid ritualId')
        .trim(),
];

exports.deleteLiveStreaming_validator = [

    param('id')
        .not()
        .isEmpty()
        .withMessage('id is required')
        .isString().withMessage('id should be a string')
        .isMongoId()
        .withMessage('please enter a valid id')
        .trim(),

    param('LIVE_STREAM_ID')
        .not()
        .isEmpty()
        .withMessage('LIVE_STREAM_ID is required')
        .isString().withMessage('LIVE_STREAM_ID should be a string')
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