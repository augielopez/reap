var express = require('express');
var router = express.Router();
var authRouter = express.Router();
var oauthTools = require(process.cwd()+'/node_modules/oauth2orize/lib/utils');
var passport = require(process.cwd() + '/lib/passport');

var API = '/api/v1';

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

//
// Auth
//

router.post('/auth/create', function(req,res) {
  if (!req.body || !req.body.email || !req.body.username || !req.body.password) {
    return res.send(400, "Bad Request");
  }
  //
  // Need to call RBSS and create new user, for now we fake it
  //
  var createUser = {
    email: req.body.email,
    name: req.body.name,
    username: req.body.username,
    avatar: null,
    lastLoginAt: new Date(),
    loginCount: 1,
  };
  //
  // Sets password and passwordSalt
  //
  Real.Models.User.initPasswordFields(createUser, req.body.password);
  //
  // Create User and then Create Client Authorization
  //
  Real.Models.User.create(createUser).success(function(user){
    var ca = {
      // Hard coded for iOS app
      ClientId: 1,
      UserId: user.id,
      accessToken: oauthTools.uid(128)
    }
    Real.Models.ClientAuthorization.create(ca).success(function(newCA) {
      var obj1 = _.clone(user.dataValues);
      var result = _.omit(_.extend(obj1, newCA.dataValues),['password','passwordSalt','deletedAt','ClientId','UserId','RBToken','scope','code','refreshToken','expiresAt']) ;
      result.id = user.dataValues.id;
      res.status(200).send(result);
    }).error(function(err){
      if (err) {
        console.log(err);
        res.status(500).send();
      }
    });
  }).error(function(err){
    if (err) {
      console.log(err);
      res.status(500).send();
    }
  });
});

router.route('/auth/login').post(passport.authenticate('local'), function (req, res) {
  res.status(200).send(req.user);
});


//
// API
//
authRouter.use(passport.authenticate('bearer', { session: false }),
  function(req, res, next) {
    console.log(req.user);
    next();
});



module.exports = router;