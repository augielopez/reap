var config = require(__dirname + '/../config/config.js');
require(__dirname + '/../lib/sequelize');

var clientsData = [
  {
    id: 1,
    name: 'Web',
    type: 'public',
    site: 'http://localhost:5000/',
    icon: 'http://localhost:5000/',
    clientId: 'd847cefec9463266e913e1d0757f3575dc100ab93e98bb99',
    clientSecret: 'bc9a46fe767485dbdbcd62b02eda0f7ef2d695f444948ab8bd5fbac6a8efb3a6ad25a6a7c12300b52a03647933125fcf',
    redirectURI: 'http://localhost:5000/'
  }
]

var clientAuthorizationData = [
  {
    id: 1,
    ClientId: 1,
    UserId: null,
    scope: null,
    code: null,
    accessToken: 'tttgRmO3fb0HlNUXyVCkZWA4UWxbnYph8WP6cZyBYSxyktmcpjjwhrPCKig2kgOr0bKrGzVOvHnUsE0JYFjRiq4PgMYr1szSxRScC0aCEmBlPBIzHV0rc5lmYZ9pE6Gg',
    refreshToken: null,
    expiresAt: null
  }
]

async.waterfall([
  function(cb) {
    RBMix.Models.Client.bulkCreate(clientsData).success(function(result){
      console.log('clients created');
      cb();
    }).error(cb);
  },
  function(cb) {
    RBMix.Models.ClientAuthorization.bulkCreate(clientAuthorizationData).success(function(result){
      console.log('client authorizations created');
      cb();
    }).error(cb);
  }
], function(err) {
  if(err) {
    console.log('error', err);
  }
  console.log('done');
  process.exit(1);
});
