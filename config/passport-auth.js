// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

  'facebookAuth' : {
    'clientID'    : '365306936946177', // your App ID
    'clientSecret'  : '3bc2ba1218b4cd0da24083821404014c', // your App Secret
    'callbackURL'   : 'http://localhost:3000/auth/facebook/callback'
  },

  'twitterAuth' : {
    'consumerKey'     : '1owEokFzzkdsQBPL0aiHA',
    'consumerSecret'  : 'f4xYRrpv1DeYAlDJfMru9nRjeWut0z5FC41QfSjCXOc',
    'callbackURL'     : 'http://localhost:3000/auth/twitter/callback'
  },

  'googleAuth' : {
    'clientID'    : 'your-secret-clientID-here',
    'clientSecret'  : 'your-client-secret-here',
    'callbackURL'   : 'http://localhost:3000/auth/google/callback'
  }

};