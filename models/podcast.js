module.exports = function(sequelize, DataTypes) {
  var domain = require('./domain').domain(DataTypes);
  var columns = {
    name: domain.anyname,
    GenreId: domain.id,
    description: domain.desc,
    membershipCount: domain.int,
    avatar: domain.url,
    UserId: domain.id
  };

  return sequelize.define("Podcast", columns, {
    classMethods: {
      whitelist: ['id', 'name', 'avatar', 'profile']
    },
    instanceMethods: {
    }
  });
}
