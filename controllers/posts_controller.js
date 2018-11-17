const Token = require('../models/post');
const postToken = require('../database/postToken');
const request = require('request');
const url = "https://api.coinmarketcap.com/v2/listings/";

// Displays a list of all blog posts
exports.index = function (req, res, next) {
	request(url, { json: true }, (err, response, body) => {
		if (err) { return console.log(err); }
		res.render('posts/index', { title: 'Populate tokens' });
	});
};

exports.populate = function (req, res, next) {
	postToken();
	res.render('posts/index', { title: 'Populate tokens Success' });
};
