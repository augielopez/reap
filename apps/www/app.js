var config = require(process.cwd() + '/config/config');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sequelize = require(process.cwd() + '/lib/sequelize');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var passport = require(process.cwd() + '/lib/passport');

var routes = require('./routes/index');
var debug = require('debug')('reap');

var app = express();

// CORS headers
var allowCrossDomain = Reap.Config.get('allowCrossDomain');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(allowCrossDomain);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ 
  store : new RedisStore({client: Reap.redisClient}),
  cookie : {
    // 3600000 milisecond = one hour
    maxAge: 3600000 * 72
  },
  secret: Reap.Config.get("Express").secret,
  saveUninitialized: true,
  resave: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

sequelize.sync({force: false}).success(function() {
  console.log("DB synced successfully");
  var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
  });
}).error(function(error) {
  console.log("DB sync error: "+error);
});

module.exports = app;
