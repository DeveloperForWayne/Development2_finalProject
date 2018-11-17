const mongoose = require('mongoose');

let tokenSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    website_slug: {
        type: String,
        required: true
    },
 });

let tokenModel = mongoose.model('Token', tokenSchema);

module.exports = tokenModel;
