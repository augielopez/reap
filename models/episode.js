module.exports = function(sequelize, DataTypes) {
  var domain = require('./domain').domain(DataTypes);
  var columns = {
    title: domain.anyname,
    PodcastId: domain.id,
    description: domain.desc,
    publishedAt: domain.timestamp,
    avatar: domain.url,
    UserId: domain.id
  };

  return sequelize.define("Episode", columns, {
    classMethods: {
      whitelist: ['id', 'title', 'PodcastId', 'description', 'publishedAt']
    },
    instanceMethods: {
    }
  });
}
