// 'use strict';
var read = require('node-read'),
    cheerio = require('cheerio');

/* session helper */
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

/* read ability */
exports.read = function(url, callback) {
  read(url, function(err, article) {
    if(err) {
      callback(err);
    } else {
      var doc = cheerio.load(article.html),
          content = cheerio.load(article.content);

      var returnData = {
        'title': article.title,
        'content': article.content,
        'thumbnail': getThumbnail(doc, content),
        'favicon': getFavicon(doc),
        'htmlDoc': doc
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

var getThumbnail = function(doc, content) {
  var contentImages = content("img");
  var images = doc("meta[property='og:image'], meta[itemprop=image], meta[name='twitter:image:src'], meta[name='twitter:image'], meta[name='twitter:image0']");
  if(contentImages.length > 0 && contentImages.first().attr('src')){
    return contentImages.first().attr('src');
  } else if (images.length > 0 && images.first().attr('content')) {
    return images.first().attr('content');
  } else{
    return '';
  }
}

var getFavicon = function (doc) {
  var tag;
  tag = doc('link').filter(function () {
    var cache$;
    return (null != (cache$ = doc(this).attr('rel')) ? cache$.toLowerCase() : void 0) === 'shortcut icon';
  });
  return tag.attr('href');
}


/* misc helpers */
exports.stripTags = function (input, allowed) {
  allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
  var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
    commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
  return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
    return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
  });
};

function dynamicSort(property) {
  var sortOrder = 1;
  if(property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a,b) {
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * sortOrder;
  }
};

exports.dynamicSortMultiple = function () {
  /*
   * save the arguments object as it will be overwritten
   * note that arguments object is an array-like object
   * consisting of the names of the properties to sort by
   */
  var props = arguments;
  return function (obj1, obj2) {
    var i = 0, result = 0, numberOfProperties = props.length;
    /* try getting a different result from 0 (equal)
     * as long as we have extra properties to compare
     */
    while(result === 0 && i < numberOfProperties) {
        result = dynamicSort(props[i])(obj1, obj2);
        i++;
    }
    return result;
  }
}

exports.parseUri = function (sourceUri) {
  var uriPartNames = ["source","protocol","authority","domain","port","path","directoryPath","fileName","query","anchor"],
    uriParts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(sourceUri),
    uri = {};

  for(var i = 0; i < 10; i++){
    uri[uriPartNames[i]] = (uriParts[i] ? uriParts[i] : "");
  }

  if(uri.directoryPath.length > 0){
    uri.directoryPath = uri.directoryPath.replace(/\/?$/, "/");
  }

  return uri;
}
