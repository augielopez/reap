var passport = require('passport')
  , BearerStrategy = require('passport-http-bearer').Strategy
  , LocalStrategy = require('passport-local').Strategy;

var webClient = 'tttgRmO3fb0HlNUXyVCkZWA4UWxbnYph8WP6cZyBYSxyktmcpjjwhrPCKig2kgOr0bKrGzVOvHnUsE0JYFjRiq4PgMYr1szSxRScC0aCEmBlPBIzHV0rc5lmYZ9pE6Gg'

passport.use(new BearerStrategy(
  function(token, done) {
    if (token == webClient) {
      var anon = Reap.Models.User.build({});
      return done(null, anon);
    }
    Reap.Models.ClientAuthorization.find({
      where: {
        accessToken: token
      }
    }).success(function (ca) {
      if (!ca) {
        return done(null, false);
      } else {
        Reap.Models.User.find({
          where: {
            id: ca.UserId
          }
        }).success(function(user) {
          if (!user) {
           return done(null, false); 
          } else {
            return done(null, user);
          }
        });
      }
    });
  }
));

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  function(email, password, done) {
    process.nextTick(function () {
      Reap.Models.User.find({
        include: [
          Reap.Models.ClientAuthorization
        ],
        where: ['lower("Users"."email")=? AND "Users"."deletedAt" IS NULL', email.toLowerCase()
        ]
      }).success(function(user) {
        if (!user) {
          return done(null, false, { message: 'Unknown user ' + username });
        }
        user.verifyPassword(password, function(result) {
          if (result)
            return done(null, user);
          else
            return done(null, false, { message: 'Invalid password' });
        });
      })
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Reap.Models.User.find({
    where: {
      id: id
    }
  }).success(function(user){
    done(null, user);
  });
});

module.exports = passport;