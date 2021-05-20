const mongoose = require('mongoose');

const ReportSchema = mongoose.Schema({
    description: {
        type: String,
        maxLength: 500
    },
    image: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    reportId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Reports', ReportSchema);