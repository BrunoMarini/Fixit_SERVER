const mongoose = require('mongoose');

const ResolvedPositionSchema = mongoose.Schema({
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
        type: Number,
        required: true
    },
    adminResponsible: {
        type: [ String ]
    }
});

ResolvedPositionSchema.index({ location: "2dsphere"});
ResolvedPositionSchema.index({ coordinates: "2dsphere"});

module.exports = mongoose.model('ResolvedPosition', ResolvedPositionSchema);