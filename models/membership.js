module.exports = function(sequelize, DataTypes) {
  var domain = require('./domain').domain(DataTypes);
  var columns = {
    UserId: domain.id,
    PodcastId: domain.id
  };

  return sequelize.define("Membership", columns, {
    classMethods: {
      whitelist: ['id', 'UserId', 'PodCastId']
    },
    instanceMethods: {
    }
  })
}

