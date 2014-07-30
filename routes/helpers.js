'use strict';
var read = require('node-read');

exports.isLoggedIn = function(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()){
    return next();
  }
  else{
    // if they aren't, redirect them to the home page
    res.redirect('/');
  }
};

exports.read = function(url, callback) {
  read(url, function(err, article) {
    if(err) {
      callback(err);
    } else {
      var returnData = {
        'title': article.title,
        'content': article.content
      };
      callback(null, returnData);

      // Main Article.
      // console.log(article.content);

      // Title
      // console.log(article.title);

      // HTML
      // console.log(article.html);

      // DOM
      // console.log(article.dom);
    }

  });
};
