const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const passport = require('passport');
const User = require('../models/user');
const Post = require('../models/post');
const Ticker = require('../models/ticker');

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
            message = 'Email is already in use!';
            res.render('portfolio/search', { title, csrfToken: req.csrfToken(), portfolioName: req.user.portfolioName, ticker: null, messages: 'Ticker is already existed!' });
        } else {
            const newTicker = new Ticker();

            newTicker.email = req.user.email;
            newTicker.portfolioName = req.user.portfolioName;
            newTicker.tickerName = req.body.tickerName;
            newTicker.balance = 0;
    
            newTicker.save((err, result) => {
                if (err) console.log(err)
            }); 
            res.redirect('search');
        }
    })
});

router.delete('/search', isLoggedIn, (req, res, next) => {
    Ticker.findOneAndRemove({'email': req.user.email, 'portfolioName': req.user.portfolioName, 'tickerName': req.body.tickerName }, (err, ticker) => {
		if (err) return console.log(err);
		res.redirect('search');
	})
});

router.post('/login', passport.authenticate('local.login', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/login',
    failureFlash: true
}));

router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
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