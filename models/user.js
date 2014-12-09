var crypto = require('crypto')
  , util = require(process.cwd()+'/lib/resources.js');

module.exports = function(sequelize, DataTypes) {
  var domain = require('./domain').domain(DataTypes);
  var columns = {
    username: domain.anyname,
    name: domain.name,
    password: domain.passwd,
    passwordSalt: domain.passwd,
    avatar: domain.url,
    lastLoginAt: domain.date,
    loginCount: domain.int
  };

  var initPasswordFields = function (user, passwd) {
    var passSum = crypto.createHash('sha1');

    user.passwordSalt = util.getSalt();
    passSum.update(passwd).update(user.passwordSalt);
    user.password = passSum.digest('hex');
  }

  var validatePasswordRules = function(pw, cb) {
    if (!_.isString(pw) || pw.length <= 5) {
      cb('New password is too short');
    } else {
      cb();
    }
  }


  return sequelize.define("User", columns, {
    classMethods: {
      whitelist: ['id', 'username', 'name', 'avatar'],
      initPasswordFields: initPasswordFields,
      validatePasswordRules: validatePasswordRules
    },
    instanceMethods: {
      verifyPassword: function(passwd, cb) {
        var _this = this;
        var passSum = crypto.createHash('sha1');

        passSum.update(passwd).update(_this.passwordSalt);
        cb(_this.password == passSum.digest('hex'));
      }
    }
  });
}
