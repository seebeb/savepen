var express         = require('express'),
    router          = express.Router(),
    passport        = require('passport'),
    helpers         = require('./helpers'),
    ContentModel    = require('../models/contents');

router.get('/content', function(req, res) {
  var page = (req.query.page) ? Math.abs(req.query.page) : 1,
      perpage = (req.query.perpage) ? Math.abs(req.query.perpage) : 20,
      match = {};

  ContentModel.get(match, perpage, page, '/api/content', function(err, contents) {
    res.jsonp(contents);
  });
});


router.post('/content', function(req, res) {
  var url = req.body.url;

  console.log('saving URL: ' + url);

  // res.status(200).jsonp({ message: 'content from: '+ url +' has been saved' });
  // call helper to do readability function
  helpers.read(url, function(err, content) {
    if(err){
      res.status(500).jsonp({ status: false, message: 'failed to parse content from: ' + url });
    } else{
      storeContent(content);
    }
  });

  var storeContent = function(content){
    // prep data before store it to model
    var urlObj = helpers.parseUri(url);
    var storeData = {
      url: url,
      domain: urlObj.domain,
      baseUrl: urlObj.protocol + '://' + urlObj.authority + '/',
      title: content.title,
      content: content.content,
      thumbnail: content.thumbnail,
      favicon: content.favicon
    }

    // store the data to model
    ContentModel.store(storeData, function(err, content_id){
      res.status(200).jsonp({ status: true, message: 'content from: '+ url +' has been saved', _id: content_id });
    });
  }
});


router.get('/content/:id', function(req, res) {
  var match = { _id : req.params.id};

  ContentModel.getOne(match, function(err, content) {
    if(err){
      res.status(500).jsonp({ message: 'failed to get content: ' + req.params.id });
    } else {
      res.status(200).jsonp(content);
    }
  });
});

module.exports = router;
