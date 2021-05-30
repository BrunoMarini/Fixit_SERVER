const mongoose = require('mongoose');

const BlackListSchema = mongoose.Schema({
    email: {
        type: String,
    },
    phone: {
        type: String,
    }
});

module.exports = mongoose.model('UserBlackList', BlackListSchema);