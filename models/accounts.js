var mongoose = require("mongoose");
var crypto = require('crypto');

var accountSchema = mongoose.Schema({
  local: {
    username: {type: String, default: ""},
    email: String,
    password: String,
    avatar: {type: String, default: ""}
  },
  facebook: {
    id           : String,
    token        : String,
    email        : String,
    name         : String,
    avatar       : {type: String, default: ""}
  },
  twitter: {
    id           : String,
    token        : String,
    displayName  : String,
    username     : String,
    avatar       : {type: String, default: ""}
  },
  google: {
    id           : String,
    token        : String,
    email        : String,
    name         : String
  },
  fullname: String,
  bio: {type: String, default: ""},
  website: {type: String, default: ""},
  created: {type: Date, default: Date.now},
  status: {type: Number, default: 1}
});

var Account = mongoose.model("Account", accountSchema);

/* Local Login and Register */
exports.localLogin = function(email, password, callback)
{
  Account.findOne({ 'local.email' :  email }, function(err, user) {
    if(err)
      callback(err);

    if(!user) {
      callback(null, "not-found");
    } else {
      validatePassword(password, user.local.password, function(err, res) {
        if(res) {
          callback(null, user);
        } else {
          callback(null, 'invalid-password');
        }
      });
    }
  });
}

exports.register = function(data, callback)
{
  Account.findOne({ 'local.email' : data.email }, function(err, user) {
    if(err){
      callback(err);
    }

    if(user) {
      callback(null, "email-registered");
    } else {
      saltAndHash(data.password, function(hash){
        var newData = {
          local: {
            email: data.email,
            password: hash
          },
          fullname: data.fullname
        };
        var newAccount = new Account(newData);
        newAccount.save(function(err, res){
          if(err) {
            callback(null, "failed");
          }
          else{
            callback(null, res);
          }
        });
      });
    }

  });
}

/* Facebook Login and Register */
exports.facebookLogin = function(profile, callback)
{
  Account.findOne({ 'facebook.id' : profile.id }, function(err, user) {
    // if there is an error, stop everything and return that
    // ie an error connecting to the database
    if (err)
      return callback(err);

    // if the user is found, then log them in
    if (user) {
      return callback(null, user); // user found, return that user
    } else {
      // if there is no user found with that facebook id, create them
      var newUser = new Account();

      // set all of the facebook information in our user model
      newUser.facebook.id     = profile.id; // set the users facebook id
      newUser.facebook.token  = token; // we will save the token that facebook provides to the user
      newUser.facebook.name   = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
      newUser.facebook.email  = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
      newUser.fullname        = profile.name.givenName + ' ' + profile.name.familyName;
      newUser.avatar          = profile.photos[0].value; // facebook can return multiple photos so we'll take the first

      // save our user to the database
      newUser.save(function(err) {
        if (err)
          callback(err);

        // if successful, return the new user
        return callback(null, newUser);
      });
    }

  });
}

/* account management */
exports.update = function(sessionID, userData, callback)
{
  Account.findOne({_id:sessionID}, function(err, user){
    if(user != null){
      Account.findOneAndUpdate({_id:sessionID},
        { $set: userData }, function(e, o){
          callback(e, o);
      });
    }

  });

}

exports.get = function(limit, except, callback)
{
  var userLimit = (limit!=undefined) ? limit : 10;
  var AccountList = Account.find({_id: {'$ne': except }})
    .sort("-created")
    .limit(userLimit)
    .exec(function(err, users){
    if(err){
      callback("failed");
    }
    else{
      callback(null, users);
    }
  });
}

exports.getById = function(id, callback)
{
  Account.findOne({ _id: id }, function(e, o){
    if(e){
      callback("failed");
    }
    else{
      callback(null, o);
    }
  });
}


/* account lookup methods */
var generateSalt = function()
{
  var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
  var salt = '';
  for (var i = 0; i < 10; i++) {
    var p = Math.floor(Math.random() * set.length);
    salt += set[p];
  }
  return salt;
}

var md5 = function(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass, callback)
{
  var salt = generateSalt();
  callback(salt + md5(pass + salt));
}

var validatePassword = function(plainPass, hashedPass, callback)
{
  var salt = hashedPass.substr(0, 10);
  var validHash = salt + md5(plainPass + salt);
  callback(null, hashedPass === validHash);
}

// create the model for users and expose it to our app
// module.exports = mongoose.model('Account', accountSchema);
