module.exports = function(sequelize, DataTypes) {
  var domain = require('./domain').domain(DataTypes);
  var columns = {
    name: domain.name
  };

  return sequelize.define("Track", columns, {
    classMethods: {
      whitelist: ['id','name']
    },
    instanceMethods: {
    }
  })
}

