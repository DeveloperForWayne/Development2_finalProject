const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const passport = require('passport');

const csrfProtect = csrf();

router.use(csrfProtect);

const title = 'Cryptocurrency Portfolio';

router.get('/profile', isLoggedIn, (req, res, next) => {
    res.render('user/profile', {title});
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