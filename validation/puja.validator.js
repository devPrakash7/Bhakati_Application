
const { body, validationResult, param, query } = require('express-validator');




exports.add_puja_validator = [

    body('puja_name')
        .not()
        .isEmpty()
        .withMessage('puja_name is required')
        .isString().withMessage('puja_name should be a string')
        .trim(),

    body('description')
        .not()
        .isEmpty()
        .withMessage('description is required')
        .isString().withMessage('description should be a string')
        .trim(),

    body('category')
        .not()
        .isEmpty()
        .withMessage('category is required')
        .isString().withMessage('category should be a string')
        .trim(),
];


exports.puja_add_by_temple_validator = [

    body('puja_name')
        .not()
        .isEmpty()
        .withMessage('puja_name is required')
        .isString().withMessage('puja_name should be a string')
        .trim(),

    body('duration')
        .not()
        .isEmpty()
        .withMessage('duration is required')
        .isNumeric().withMessage('duration should be a number')
        .trim(),

    body('price')
        .not()
        .isEmpty()
        .withMessage('price is required')
        .isNumeric().withMessage('price should be a number')
        .trim(),

    body('puja_id')
        .not()
        .isEmpty()
        .withMessage('puja_id is required')
        .isString().withMessage('puja_id should be a string')
        .isMongoId().withMessage('please enter a valid puja_id')
        .trim(),
]

exports.delete_puja_validator = [

    query('id')
        .not()
        .isEmpty()
        .withMessage('puja_id is required')
        .isString().withMessage('puja_id should be a string')
        .isMongoId().withMessage('please enter a valid puja_id')
        .trim(),
]

exports.delete_puja_by_admin_validator = [

    param('puja_id')
        .not()
        .isEmpty()
        .withMessage('puj id is required')
        .isString().withMessage('puja id should be a string')
        .isMongoId().withMessage('please enter a valid puja id')
        .isLength({ min: 24 }).withMessage('puja id length must be 24')
        .trim(),

]




exports.Validator_Result = (req, res, next) => {

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