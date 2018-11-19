const express = require('express');
const request = require('request');
const router = express.Router();
const csrf = require('csurf');
const passport = require('passport');
const User = require('../models/user');
const Post = require('../models/post');
const Ticker = require('../models/ticker');
const urlHead = "https://api.coinmarketcap.com/v2/ticker/";
const urlTear = "/?convert=USD";

const csrfProtect = csrf();

router.use(csrfProtect);

const title = 'Cryptocurrency Portfolio';

router.get('/search', isLoggedIn, (req, res, next) => {
    Ticker.find({ 'email': req.user.email, 'portfolioName': req.user.portfolioName }, (err, ticker) => {
        if (err) return console.log(err);
        res.render('portfolio/search', { title, csrfToken: req.csrfToken(), portfolioName: req.user.portfolioName, ticker: ticker, messages: '' });
    });
});

router.get('/searchResult', isLoggedIn, (req, res, next) => {
    Post.findOne({ $or: [{ 'name': req.query.tokenName }, { 'symbol': req.query.tokenName }, { 'website_slug': req.query.tokenName }] }, (err, post) => {
        if (err) return console.log(err);
        if (!post) {
            res.render('portfolio/searchResult', { title, csrfToken: req.csrfToken(), post: null, messages: 'No token found!' });
        } else {
            res.render('portfolio/searchResult', { title, csrfToken: req.csrfToken(), post: post, messages: '' });
        }
    });
});

router.post('/search', isLoggedIn, (req, res, next) => {
    Ticker.findOne({ 'email': req.user.email, 'portfolioName': req.user.portfolioName, 'tickerName': req.body.tickerName }, (err, ticker) => {
        if (err) console.log(err);
        if (ticker) {
            message = 'Ticker is already existed!';
            res.render('portfolio/search', { title, csrfToken: req.csrfToken(), portfolioName: req.user.portfolioName, ticker: null, messages: 'Ticker is already existed!' });
        } else {
            const newTicker = new Ticker();

            newTicker.email = req.user.email;
            newTicker.portfolioName = req.user.portfolioName;
            newTicker.tickerId = req.body.tickerId;
            newTicker.tickerName = req.body.tickerName;
            newTicker.balance = 0;
            newTicker.value = 0;

            newTicker.save((err, result) => {
                if (err) console.log(err)
            });
            res.redirect('search');
        }
    })
});

router.delete('/search', isLoggedIn, (req, res, next) => {
    Ticker.findOneAndRemove({ 'email': req.user.email, 'portfolioName': req.user.portfolioName, 'tickerName': req.body.tickerName }, (err, ticker) => {
        if (err) return console.log(err);
        res.redirect('search');
    })
});

router.put('/search', isLoggedIn, (req, res, next) => {
    request(urlHead + req.body.tickerId + urlTear, { json: true }, (err, response, body) => {
        if (err) return console.log(err);
        let totalValue = body.data.quotes.USD.price * req.body.balance;
        Ticker.findOneAndUpdate({'email': req.user.email, 'portfolioName': req.user.portfolioName, 'tickerId': req.body.tickerId}, {$set:{ value: totalValue}}, {new: true}, function(err, ticker) {
            if (err) return console.log(err);
            res.redirect('search');
        })
    });
});

router.get('/balance', isLoggedIn, (req, res, next) => {
    Ticker.findOne({ 'email': req.user.email, 'portfolioName': req.user.portfolioName, 'tickerName': req.query.tickerName }, (err, ticker) => {
        if (err) console.log(err);
        res.render('portfolio/balance', { title, csrfToken: req.csrfToken(), ticker: ticker});
    })
});

router.put('/balance', isLoggedIn, (req, res, next) => {
    request(urlHead + req.body.tickerId + urlTear, { json: true }, (err, response, body) => {
        if (err) return console.log(err);
        let totalValue = body.data.quotes.USD.price * req.body.balance;
        Ticker.findOneAndUpdate({'email': req.user.email, 'portfolioName': req.user.portfolioName, 'tickerId': req.body.tickerId}, {$set:{balance: req.body.balance, value: totalValue}}, {new: true}, function(err, ticker) {
            if (err) return console.log(err);
            res.redirect('search');
        })
    });
});


module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}