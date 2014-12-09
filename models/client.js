var crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {
  var domain = require('./domain').domain(DataTypes);
  var columns = {
    UserId: domain.id,
    name: domain.name,
    type: domain.type,
    site: domain.url,
    icon: domain.url,
    clientId: domain.uniqueName,
    clientSecret: domain.extSignature,
    redirectURI: domain.url
  };

  return sequelize.define("Client", columns, {
    classMethods: {
      createCredentials: function() {
        // Generate keys
        var creds = {};

        var buf = crypto.randomBytes(24);
        creds['clientId'] = buf.toString('hex');

        buf = crypto.randomBytes(48);
        creds['clientSecret'] = buf.toString('hex');

        return creds;
      }
    },
    instanceMethods: {
      method: function() { return 'foo' }
    }
  });
}