module.exports = function(sequelize, DataTypes) {
  var domain = require('./domain').domain(DataTypes);
  var columns = {
    name: domain.anyname,
    TypeId: domain.id,
    content: domain.json,
    EpisodeId: domain.id,
    UserId: domain.id
  };

  return sequelize.define('Segment', columns, {
    classMethods: {
      whitelist: ['id', 'name', 'TypeId', 'content']
    },
    instanceMethods: {
    }
  });
}
