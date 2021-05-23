const mongoose = require('mongoose');

const AdminSchema = mongoose.Schema({
    institution: {
        type: String,
        required: true
    },
    sector: {
        type: String,
        require: true
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Active'],
        default: 'Pending'
    },
    token: {
        type: String,
        unique: true,
        required: true
    }
});

module.exports = mongoose.model('Admin', AdminSchema);