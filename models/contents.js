var mongoose = require("mongoose"),
    superPagination = require('super-pagination').mongoose,
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var contentSchema = mongoose.Schema({
  url: String,
  domain: String,
  baseUrl: String,
  created: {type: Date, default: Date.now},
  title: String,
  content: String,
  thumbnail: {type: String, default: ""},
  favicon: {type: String, default: ""}
});

contentSchema.plugin(superPagination, {
  theme : 'bootstrap'
});

var contentModel = mongoose.model("Content", contentSchema);

exports.get = function(match, limit, offset, url, callback)
{
  contentModel.paginate({
    query : match || {},
    page : offset || 1,
    sort : {
      'created' : -1
    },
    per_page : limit || 10,
    show_next : false,
    show_prev : false,
    url : url
  }, function(err, result, pagination) {
    if(err) {
      callback("failed");
    } else {
      callback(null, result, pagination);
    }
  });
}

exports.getOne = function(match, callback)
{
  var params = match || {};
  contentModel.findOne(params).exec(function(err, result){
    if(err){
      callback("failed");
    }
    else{
      callback(null, result);
    }
  });
}

exports.store = function(data, callback)
{
  var content = new contentModel(data);
  content.save(function(err){
    if(err) {
      callback(err);
    }
    else{
      callback(null, content._id);
    }
  });
}
