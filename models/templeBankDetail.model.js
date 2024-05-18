


const mongoose = require('mongoose');



const BankSchema = new mongoose.Schema({

    account_number: {
        type: Number,
        default: null,
    },
    ifsc_code: {
        type: String,
        default: null,
    },
    master_bank_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bank',
        default: null
    },
    bank_logo: {
        type: String
    },
    bank_name: {
        type: String
    },
    templeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'temple',
        default: null,
    },
    created_at: {
        type: String
    },
    updated_at: {
        type: String
    }
})

const TempleBankDetails = mongoose.model('TempleBankDetails', BankSchema);
module.exports = TempleBankDetails;