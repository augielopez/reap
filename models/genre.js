module.exports = function(sequelize, DataTypes) {
  var domain = require('./domain').domain(DataTypes);
  var columns = {
    name: domain.name,
    description: domain.desc
  };

  return sequelize.define('Genre', columns, {
    classMethods: {
      whitelist: ['id', 'name', 'description']
    },
    instanceMethods: {
    }
  })
}

