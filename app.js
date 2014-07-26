'use strict';

// ### Environment setup ###
var env, config, viewCache, swigCache;

env = process.env.NODE_ENV || 'production';

env = 'development';
if (env != 'production') {
  viewCache = false;
  swigCache = false;
} else {
  viewCache = true;
  swigCache = 'memory';
}

var express         = require('express'),
    path            = require('path'),
    favicon         = require('static-favicon'),
    logger          = require('morgan'),
    cookieParser    = require('cookie-parser'),
    swig            = require('swig'),
    bodyParser      = require('body-parser'),
    session         = require('cookie-session'),
    config          = require('./config/config.json'),
    db              = config.db,
    passport        = require('passport'),
    mongoose        = require('mongoose'),
    flash           = require('connect-flash'),
    app             = express();

// view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view cache', viewCache);
swig.setDefaults({ cache: swigCache });

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

// Required for passport
app.use(session(config.sessions)); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// ### Database setup ###
mongoose.connect(db.mongoose, function(err, res) {
  if (err) {
    console.error(("Failed to connect " + db.mongoose).red);
  } else {
    console.info(("Connected to MongoDB server! " + db.mongoose).green);
  }
});

require('./config/passport')(passport);

var routes          = require('./routes/index'),
    accounts           = require('./routes/accounts');

app.use('/', routes);
app.use('/accounts', accounts);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error.html', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error.html', {
    message: err.message,
    error: err
  });
});


module.exports = app;
