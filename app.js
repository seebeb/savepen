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


var routes          = require('./routes/index'),
    users           = require('./routes/users');

app.use('/', routes);
app.use('/users', users);

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
