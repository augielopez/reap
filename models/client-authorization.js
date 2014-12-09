module.exports = function(sequelize, DataTypes) {
  var domain = require('./domain').domain(DataTypes);
  var columns = {
    ClientId: domain.id,
    UserId: domain.int,
    scope: domain.string,
    code: domain.uniqueName,
    accessToken: domain.uniqueName,
    refreshToken: domain.string,
    expiresAt: domain.date
  };

  return sequelize.define("ClientAuthorization", columns, {
    classMethods: {

    },
    instanceMethods: {

    }
  });
}