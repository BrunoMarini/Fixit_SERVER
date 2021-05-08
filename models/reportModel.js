const mongoose = require('mongoose');

const ReportSchema = mongoose.Schema({
    name: String,
    desc: String,
    image: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Reports', ReportSchema);