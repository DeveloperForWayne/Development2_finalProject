const mongoose = require('mongoose');
const Token = require('../models/post');
const dbConnect = require('./database');
const request = require('request');
const url = "https://api.coinmarketcap.com/v2/listings/";
const recordNm = 200;


function postToken() {
    dbConnect();

    request(url, { json: true }, (err, res, body) => {
        if (err) return console.log(err);

        for (let i = 0; i < recordNm; i++) {
            let tokens = new Token({ id: body.data[i].id, name: body.data[i].name, symbol: body.data[i].symbol, website_slug: body.data[i].symbol })
            tokens.save((err, result) => {
                if (err) return res.status(500).send(err);
            });
        }
        res.json({ success: true });
        mongoose.disconnect();
    });
}

module.exports = postToken;