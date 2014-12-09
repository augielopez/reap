exports.domain = function(DataTypes){
  var Sequelize = require('sequelize');
  var isOptionalEmail = function(value) {
    if(value.length) {
      if(!value.match(/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/)) {
        throw new Error('Invalid optional email');
      }
    }
  };

  return {
    // standard type
    "timestamp" :   {type: Sequelize.BIGINT},
    "date" :        {type: Sequelize.DATE},
    "int" :         {type: Sequelize.INTEGER},
    "bigint" :      {type: Sequelize.BIGINT},
    "boolean" :     {type: Sequelize.BOOLEAN},
    "string":       {type: Sequelize.STRING},
    "float":        {type: Sequelize.FLOAT},
    "text":         {type: Sequelize.TEXT},
    "json":         {type: Sequelize.JSON},
    // custom type
    "id" :          {type: Sequelize.INTEGER, validate: {isInt: true , notNull : true}},
    "IP" :          {type: Sequelize.STRING, validate: {notNull : true}},
    "age" :         {type: Sequelize.INTEGER, allowNull: true, defaultValue: 0, validate: {min:0, max:100}},
    "counter" :     {type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 },
    "addrLine" :    {type: Sequelize.STRING, validate: {len: [0,255]}},
    "anyname" :     {type: Sequelize.STRING, validate: {len: [0,60]}},
    "blog16KB" :    {type: Sequelize.TEXT},
    "comments" :    {type: Sequelize.STRING, validate: {len: [0,240]}},
    "countryISO" :  {type: Sequelize.STRING, defaultValue: "US", validate: {len: [0,2]}},
    "email" :       {type: Sequelize.STRING, validate: {len: [5,120], isEmail: true}},
    "emailOptional":{type: Sequelize.STRING, allowNull: true, validate: {len: [0,120], isOptionalEmail: isOptionalEmail}},
    "extId" :       {type: Sequelize.STRING, validate: {len: [0,80]}},
    "extName" :     {type: Sequelize.STRING, validate: {len: [0,80]}},
    "extSignature" :{type: Sequelize.STRING, validate: {len: [0,1024]}},
    "grade" :       {type: Sequelize.STRING, validate: {len: [0,3]}},
    "ISO3" :        {type: Sequelize.STRING, allowNull: true, validate: {len: [0,3]}},
    "name" :        {type: Sequelize.STRING, allowNull: true, validate: {len: [0,255]}},
    "passwd" :      {type: Sequelize.STRING, allowNull: false, validate: {len: [0,128]}},
    "phone" :       {type: Sequelize.STRING, validate: {len: [0,18]}},
    "stateCode" :   {type: Sequelize.STRING, allowNull: true, validate: {len: [0,2]}},
    "type" :        {type: Sequelize.STRING, allowNull: true, validate: {len: [0,24]}},
    "typeNotNull" : {type: Sequelize.STRING, allowNull: false, validate: {len: [1,24]}},
    "desc" : {type: Sequelize.STRING, validate: {len: [0,2000]}},
    "url" :         {type: Sequelize.STRING, validate: {len: [0,240]}},
    "uniqueName" :  {type: Sequelize.STRING, validate: {len: [0,240]}, unique: true},
    "zip":          {type: Sequelize.STRING, validate: {len: [4,10], isNumeric:true}, unique:true},
    "latLng" : {type: Sequelize.STRING, validate: {len: [0,25]}},
    "tweetableString" : {type: Sequelize.STRING, validate: {len: [0,104]}},
    "booleanDefaultFalse": {type: Sequelize.BOOLEAN, defaultValue: false},
    "booleanDefaultTrue": {type: Sequelize.BOOLEAN, defaultValue: true},
    "geography":    {type: 'geography(Point, 4326)'}
  }
};
