var express   = require('express'),
    router    = express.Router(),
    passport  = require('passport');

/* GET home page. */
router.get('/', function(req, res) {
  if(req.isAuthenticated()) {
    res.render('dashboard/index.html', { state: 'home' });
  } else {
    res.redirect('/home');
  }
});

router.get('/home', function(req, res) {
  if(req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('index.html');
  }
});

/* GET,POST login */
router.get('/login', function(req, res) {
  if(req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('accounts/login', { flashMessage: req.flash() });
  }
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect : '/', // redirect to the secure dashboard section
  failureRedirect : '/login', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}));

/* GET,POST register */
router.get('/register', function(req, res) {
  if(req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.render('accounts/register', { flashMessage: req.flash() });
  }
});

router.post('/register', passport.authenticate('local-signup', {
  successRedirect : '/login', // redirect to login
  failureRedirect : '/register', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}));

/* GET logout */
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
