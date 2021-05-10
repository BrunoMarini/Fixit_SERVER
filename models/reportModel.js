const mongoose = require('mongoose');

const ReportSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ['Depredation', 'Road', 'Leak', 'Garbage', 'Flood'],
        required: true
    },
    description: {
        type: String,
        maxLength: 500
    },
    position: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    image: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Reports', ReportSchema);