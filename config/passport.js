// routes/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

// load up the user model
var Account = require('../models/accounts');

// load the auth variables
var configAuth = require('./passport-auth');

// expose this function to our app using module.exports
module.exports = function(passport) {

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    Account.getById(id, function(err, user) {
      done(err, user);
    });
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-signup', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) {

    var data = {
      email: email,
      password: password,
      fullname: req.param('fullname')
    };
    Account.register(data, function(err, result){
      if(err)
        return done(err);

      if(result == "email-registered")
        return done(null, false, req.flash('warning', 'That email is already taken.'));
      if(result == "failed")
        return done(null, false, req.flash('danger', 'Failed to register your data.'));

      return done(null, result);
    });

  }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) { // callback with email and password from our form

    Account.localLogin(email, password, function(err, result){
      if(err)
        return done(err);

      if(result == "not-found")
        return done(null, false, req.flash('danger', 'No user found.'));

      if(result == "invalid-password")
        return done(null, false, req.flash('danger', 'Oops! Wrong password.'));

      return done(null, result);
    });

  }));

  // =========================================================================
  // FACEBOOK ================================================================
  // =========================================================================
  passport.use(new FacebookStrategy({

    // pull in our app id and secret from our auth.js file
    clientID        : configAuth.facebookAuth.clientID,
    clientSecret    : configAuth.facebookAuth.clientSecret,
    callbackURL     : configAuth.facebookAuth.callbackURL

  },

  // facebook will send back the token and profile
  function(token, refreshToken, profile, done) {

    // asynchronous
    process.nextTick(function() {

      // find the user in the database based on their facebook id
      // User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

      //  // if there is an error, stop everything and return that
      //  // ie an error connecting to the database
      //  if (err)
      //    return done(err);

      //  // if the user is found, then log them in
      //  if (user) {
      //    return done(null, user); // user found, return that user
      //  } else {
      //    // if there is no user found with that facebook id, create them
      //    var newUser            = new User();

      //    // set all of the facebook information in our user model
      //    newUser.facebook.id    = profile.id; // set the users facebook id
      //    newUser.facebook.token = token; // we will save the token that facebook provides to the user
      //    newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
      //    newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

      //    // save our user to the database
      //    newUser.save(function(err) {
      //      if (err)
      //        throw err;

      //      // if successful, return the new user
      //      return done(null, newUser);
      //    });
      //  }

      // });
      Account.facebookLogin(profile, function(err, result){
        if(err)
          return done(err);

        return done(null, result);
      });
    });

  }));

};
