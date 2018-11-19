const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const passport = require('passport');
const User = require('../models/user');

const csrfProtect = csrf();

router.use(csrfProtect);

const title = 'User Managment';

router.get('/profile', isLoggedIn, (req, res, next) => {
    User.findOne({'_id': req.session.passport.user}, (err, user) => {
        if (err) return console.log(err);
        res.render('user/profile', {title, csrfToken: req.csrfToken(), email: user.email, name: user.name, portfolioName: user.portfolioName });
    });
});

router.use('/', notLoggedIn, (req, res, next) => {
    next();
})

router.get('/register', (req, res, next) => {
    const messages = req.flash('error');
    res.render('user/register', { title, csrfToken: req.csrfToken(), messages });
});

router.post('/register', passport.authenticate('local.register', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/register',
    failureFlash: true
}));

router.get('/login', (req, res, next) => {
    const messages = req.flash('error');
    res.render('user/login', { title, csrfToken: req.csrfToken(), messages });
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