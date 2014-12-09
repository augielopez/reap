GLOBAL.async = require('async');
GLOBAL._ = require('underscore');
GLOBAL.Reap = {};

var nconf = require('nconf')
  , redis = require('redis')
  , redisClient
  , url = require('url')
  , path = require('path');


// Set a default env
process.env.NODE_ENV = (process.env.NODE_ENV || "development");
process.env.CLOUDINARY_URL = (process.env.CLOUDINARY_URL || "cloudinary://916197574386389:VD5QUZVIr0nX2RdzsvZgvdZVPKA@hgtcy0hua");


// Set up a namespace
GLOBAL.Reap = {"Config":nconf};

//
// Setup nconf to use (in-order):
//   1. Environment variables
//   2. A file located at 'path/to/config.json'
Reap.Config.env().file({file : __dirname +'/'+ process.env.NODE_ENV +'.json'});

// Heroku Redis Cloud connection
var redisConfig = {};
if (process.env.REDISCLOUD_URL) {
  var rtg   = require('url').parse(process.env.REDISCLOUD_URL);
  redisConfig = {
    host: rtg.hostname, 
    port: rtg.port, 
    pass: rtg.auth.split(':')[1] 
  }
} else {
  redisConfig = {
    host: '127.0.0.1',
    port: '6379'
  };
}
var redisClient = new redis.createClient(redisConfig.port, redisConfig.host, redisConfig);
if (redisConfig.pass) {
  redisClient.auth(redisConfig.pass, function(err){
    if (err) throw err;
  });
}
nconf.set('redis:config',redisConfig);
Reap["redisClient"] = redisClient;

var allowCrossDomain = function(req, res, next) {
  if (!_.isUndefined(req) && !_.isUndefined(req.headers) && _.isString(req.headers.origin)) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
  } else {
    res.header('Access-Control-Allow-Origin', 'http://localhost');
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  } else {
    next();
  }
};

var getAge = function(days) {
  // One Day = 86400000
  if (process.env.NODE_ENV==='production' || process.env.NODE_ENV==='staging') {
    return (days*86400000);
  } else {
    return 0;
  }
}

nconf.set('staticMaxAge',getAge(365));
nconf.set('staticStudioAge', getAge(1));
nconf.set('allowCrossDomain',allowCrossDomain);
