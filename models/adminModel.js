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
    resolved: {
        type: Number,
        required: true,
        default: 0
    },
    deleted: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'FirstLogin', 'Active'],
        default: 'Pending'
    },
    token: {
        type: String,
        unique: true,
        required: true
    }
});

module.exports = mongoose.model('Admin', AdminSchema);