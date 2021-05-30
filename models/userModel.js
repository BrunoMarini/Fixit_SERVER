const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Active'],
        default: 'Pending'
    },
    reportViews: {
        type: Number,
        required: true,
        default: 0
    },
    reportSolved: {
        type: Number,
        required: true,
        default: 0
    },
    reportNumber: {
        type: Number,
        required: true,
        default: 0
    },
    token: {
        type: String,
        unique: true,
        required: true
    }
});

module.exports = mongoose.model('User', UserSchema);