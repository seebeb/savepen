var express   = require('express'),
    router    = express.Router(),
    passport  = require('passport'),
    helpers    = require('./helpers'),
    S = require('string');

router.get('/', helpers.isLoggedIn, function(req, res) {
  var url = 'http://www.hongkiat.com/blog/web-designers-essential-command-lines/';
  helpers.read(url, function(err, article) {
    var tags = {
      0: "Sublime Text",
      1: "Node.js",
      2: "Web Design",
      3: "Programming",
      4: "User Experience",
      5: "Usability",
      6: "JavaScript" };
    var tagScore = [];
    var textContent = helpers.stripTags(article.content);
    console.log(textContent);
    for(var i in tags){
      console.log(tags[i]);
      var tagCount = S(textContent.toLowerCase()).count(tags[i].toLowerCase());
      if(tagCount > 0){
        var arrTag = {
          tagName: tags[i],
          score: tagCount
        }
        tagScore.push(arrTag);
      }
    }
    // console.log(tagScore);
    tagScore.sort(helpers.dynamicSortMultiple("-score","tagName"));
    console.log(tagScore);
    res.render('explore/index.html', { state: 'explore', article: article });
  });

});


module.exports = router;
