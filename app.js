var createError = require('http-errors');
var express = require('express');
var expressLayouts = require('express-ejs-layouts');
// Method override provides access to PUT & DELETE Actions in Forms
// see: https://github.com/expressjs/method-override
var methodOverride = require('method-override');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const bodyParser = require('body-parser');
const session = require('express-session');
const helmet = require('helmet');
const passport = require('passport');
const flash = require('connect-flash');
const validator = require('express-validator');

var indexRouter = require('./routes/index');
var postsRouter = require('./routes/posts');
var usersRouter = require('./routes/users');

var database = require('./database/database');

database();

var app = express();

app.use(helmet());

require('./config/passport');

// Set layout
app.set('layout', 'layout')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());

app.use(cookieParser());

// setting csrf token for session
app.use(session({ secret: '2FjNWBV6AOgoCaDY04IcdyUwSLsqhE3Q', resave: false, saveUninitialized: false }))
app.use(flash());

// passport config
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

app.use(expressLayouts);
// Access to Delete and Put Actions In forms
app.use(methodOverride(function (req, res) {
	if (req.body && typeof req.body === 'object' && '_method' in req.body) {
		var method = req.body._method;
		delete req.body._method;
		return method;
	}
}));

app.use((req, res, next) => {
  res.locals.login = req.isAuthenticated();
  next();
});

app.use('/', indexRouter);
app.use('/post', postsRouter);
app.use('/user', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
