const mongoose = require('mongoose');

let tickerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    portfolioName: {
        type: String,
        required: true
    },
    tickerName: {
        type: String,
        required: true
    },
    balance: {
        type: Number
    },
    value: {
        type: Number
    },
 });

let tickerModel = mongoose.model('Ticker', tickerSchema);

module.exports = tickerModel;
