var express         = require('express'),
    router          = express.Router(),
    cheerio         = require('cheerio'),
    fetchUrl        = require("fetch").fetchUrl,
    ContentModel    = require('../models/contents');


router.get('/', function (req, res, next) {
  var mainUrl = 'http://designmodo.com/',
      start = (req.query.start) ? Math.abs(req.query.start) : 1,
      end = (req.query.end) ? Math.abs(req.query.end) : 10;

  for (var i = 1; i <= 2; i++) {
    if(i > 1){
      mainUrl = 'http://designmodo.com/page/' + i + '/';
    }

    // go fetch the url for me, boy!
    fetchUrl(mainUrl, function(err, meta, body) {
      var doc = cheerio.load(body),
          articles = doc('#content-wrapper .articles-container .article');

      articles.each(function(){
        var articleData, link;
        articleData = doc(this);
        link = articleData.find('h2.article-title a').attr('href');
        readUrl(link);
      });
    });
  }


  var readUrl = function(url) {
    fetchUrl(url, function(err, meta, articleBody) {
      var articleDoc = cheerio.load(articleBody);
      // get url domain
      var urlObj = parseUri(url);
      var domain = urlObj.domain;
      var baseUrl = urlObj.protocol + '://' + urlObj.authority + '/';

      // remove social media sharer
      var mediaSharer = articleDoc('.wrapper-comm-single-bottom');
      if(mediaSharer.length > 0){
        articleDoc('.wrapper-comm-single-bottom').remove();
      }
      var articleContent = articleDoc('span[itemprop="articleBody"]').html();

      // get date created
      var created = articleDoc('span[itemprop="datePublished"]').text()

      // get favicon
      var favicon = getFavicon(articleDoc);

      // get main image
      var thumbnail = getThumbnail(articleDoc);

      var data = {
        url: url,
        domain: domain,
        baseUrl: baseUrl,
        title: articleDoc('h1.single-title').text(),
        content: articleContent,
        thumbnail: thumbnail,
        favicon: favicon,
        created: created
      }

      // send to prep function
      prepContent(data);

    });
  }

  // get content thumbnail
  var getThumbnail = function(doc) {
    var images = doc("meta[property='og:image'], meta[itemprop=image], meta[name='twitter:image:src'], meta[name='twitter:image'], meta[name='twitter:image0']");
    if (images.length > 0 && images.first().attr('content')) {
      return images.first().attr('content');
    } else{
      return '';
    }
  }

  // get favicon
  var getFavicon = function (doc) {
    var tag;
    tag = doc('link').filter(function () {
      var cache$;
      return (null != (cache$ = doc(this).attr('rel')) ? cache$.toLowerCase() : void 0) === 'shortcut icon';
    });
    return tag.attr('href');
  }

  // parse URI data
  var parseUri = function (url) {
    var uriPartNames = ["source","protocol","authority","domain","port","path","directoryPath","fileName","query","anchor"],
      uriParts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(url),
      uri = {};

    for(var i = 0; i < 10; i++){
      uri[uriPartNames[i]] = (uriParts[i] ? uriParts[i] : "");
    }

    if(uri.directoryPath.length > 0){
      uri.directoryPath = uri.directoryPath.replace(/\/?$/, "/");
    }

    return uri;
  }

  // prep content before save
  var prepContent = function(data) {
    if(data.content != '' && data.domain != 'journal.designmodo.com' && data.created != '') {
      var match = { url : data.url };

      ContentModel.getOne(match, function(err, checkData) {
        if(checkData == null) {
          // send to save function
          storeContent(data);
        }
      });
    }
  }

  var storeContent = function(data) {
    // store the data to model
    ContentModel.store(data, function(){
      console.log('content from: '+ data.url +' has been saved');
    });
  }

  res.status(200).jsonp({ message: 'let the magic begin' });
});

module.exports = router;
