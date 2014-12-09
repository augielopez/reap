var express = require('express');
var router = express.Router();
var authRouter = express.Router();
var oauthTools = require(process.cwd()+'/node_modules/oauth2orize/lib/utils');
var passport = require(process.cwd() + '/lib/passport');

var auth = require('../controllers/auth');
var users = require('../controllers/users');

var API = '/api/v1';

//
// Static routes
//
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

//
// Auth
//
router.post('/auth/create', auth.createUser);
router.route('/auth/login').post(passport.authenticate('local'), auth.login);

//
// API
//
authRouter.use(passport.authenticate('bearer', {
  session: false
}), function(req, res, next) {
  next();
});

authRouter.route(API + '/users')
  .get(users.index);


module.exports = router;