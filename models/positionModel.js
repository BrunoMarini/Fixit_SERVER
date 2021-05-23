const mongoose = require('mongoose');

const PositionSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ['Depredation', 'Road', 'Leak', 'Garbage', 'Flood'],
        required: true
    },
    location: {
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
    reports: {
        type: [String],
        required: true
    }
});

PositionSchema.index({ location: "2dsphere"});
PositionSchema.index({ coordinates: "2dsphere"});

module.exports = mongoose.model('Positions', PositionSchema);