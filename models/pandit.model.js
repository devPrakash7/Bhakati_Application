

const mongoose = require('mongoose');



const panditSchema = new mongoose.Schema({

    name: {
        type: String,
    },
    mobile_number: {
        type: String
    },
    email: {
        type: String
    },
    templeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'temple'
    },
    created_at: {
        type: String
    },
    updated_at: {
        type: String
    }
})

const Pandit = mongoose.model('pandit', panditSchema);
module.exports = Pandit;