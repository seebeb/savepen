var express   = require('express'),
    router    = express.Router(),
    passport  = require('passport'),
    helpers    = require('./helpers');

router.get('/', helpers.isLoggedIn, function(req, res) {
  var url = 'http://www.hongkiat.com/blog/web-designers-essential-command-lines/';
  helpers.read(url, function(err, article) {
    res.render('explore/index.html', { state: 'explore', article: article });
  });

});


module.exports = router;
