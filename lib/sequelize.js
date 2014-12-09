var Sequelize = require('sequelize')
, connectionString = process.env.DATABASE_URL
, dbConfig = require('url').parse(connectionString);

// Set up Sequelize
var sequelize = new Sequelize(
  dbConfig.pathname.substring(1), 
  dbConfig.auth.split(':')[0], 
  dbConfig.auth.split(':')[1], 
  {
    dialect: 'postgres',
    protocol: 'postgres',
    host: dbConfig.hostname,
    port: dbConfig.port,
    pool: {
      minConnections: 1,
      maxConnections: 3,
      maxIdleTime: 30
    },
    logging:(process.env.SQL_LOGGING === 'false')?false:function(sql){ console.log(sql); },
    define: { 
      timestamps: true,  
      paranoid: true,
      charset: 'UTF-8'
    }
  }
);

var Podcast = sequelize.import(process.cwd() + '/models/podcast')
  , Episode = sequelize.import(process.cwd() + '/models/episode')
  , Genre = sequelize.import(process.cwd() + '/models/genre')
  , Membership = sequelize.import(process.cwd() + '/models/membership')
  , Segment = sequelize.import(process.cwd() + '/models/segment')
  , Type = sequelize.import(process.cwd() + '/models/type')
  , User = sequelize.import(process.cwd() + '/models/user')
  , Client = sequelize.import(process.cwd() + '/models/client')
  , ClientAuthorization = sequelize.import(process.cwd() + '/models/client-authorization');

User.hasMany(Podcast);
User.hasMany(Segment);
User.hasMany(Episode);
User.hasMany(Membership);

Podcast.hasMany(Membership);
Podcast.hasMany(Episode);
Podcast.hasOne(Genre);

Segment.hasOne(Type);
Segment.belongsTo(Episode);

Episode.belongsTo(Podcast);
Episode.hasMany(Segment);

User.hasOne(ClientAuthorization);
ClientAuthorization.belongsTo(User);
ClientAuthorization.belongsTo(Client);

// Import models
Models = {
  Podcast: Podcast,
  Episode: Episode,
  Genre: Genre,
  Membership: Membership,
  Segment: Segment,
  Type: Type,
  User: User,
  Client: Client,
  ClientAuthorization: ClientAuthorization
};

Reap.Models = Models;
module.exports = sequelize;
