var url  = require('url')
  , crypto = require('crypto');

var nonSearchParams = ['p', 'ps', 's', 'so'];
var specialSearchFields = ['$all', '$between', '$or', 'timestamp'];
var geoBoxKeys = ['left', 'bottom', 'right', 'top'];

// note this is different than _.isNumber as we know the item passed in is actually a string when we test it
// taken from http://stackoverflow.com/a/1830844/1207991
var isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

exports.isHTTPS = function (req) {
  return (!_.isUndefined(req) && !_.isUndefined(req.headers) && !_.isUndefined(req.headers['x-forwarded-proto']) &&
          req.headers['x-forwarded-proto'] === 'https');
}

exports.getSalt = function () {
  var saltSum = crypto.createHash('sha1');
  saltSum.update(Math.random().toString());
  saltSum.update((new Date()).getTime().toString());
  return saltSum.digest('hex').toString();
}

exports.getTempPasswd = function (saltVal) {
  var passSum = crypto.createHash('sha1');
  var userPassword = saltVal.substr(0, 6);   // Get a 6-digit temp pw
  passSum.update(userPassword).update(saltVal);
  return passSum.digest('hex').toString();
}

/**
 * Generic function to return the sha1 hash of stuff you pass in
 * 
 * @param theString - your stuff to hash
 * 
 * @returns the resulting hex sha1 value
 * 
 */
exports.getSha1HashOfString = function(theString) {
  var shasum = crypto.createHash('sha1');
  shasum.update(JSON.stringify(theString));
  return shasum.digest('hex');
}

var queryValidateFunc = function (iQuery, iSortorder, iSortfield, i_attributes, ignoreAttributes, cb) {
  //
  // Update 2014/4/8 JB: if the geobox values ('top', 'bottom', 'left', 'right'), are
  // found in the query string, they are validated and stored in the params object: params.geoBox
  // If these are not valid, a typical error message is returned.
  //
  
  // assign default values
  var params = iQuery;
  // p for page#
  if (!_.isString(params.p)  || (params.p.search(/[^0-9]+/)  != -1) || (params.p <= 0))  params.p = 1;
  // ps for page size
  if (!_.isString(params.ps) || (params.ps.search(/[^0-9]+/) != -1) || (params.ps < 1)) {
    if (process.env.RBSS_APP == 'studio') params.ps = 50;
    else params.ps = 24;
  }
  // so for sort ordering
  if (!_.isString(params.so) && !_.isNull(iSortorder))  params.so = iSortorder;
  // s for sorting field
  if (!_.isString(params.s) && !_.isNull(iSortfield))   params.s = iSortfield;

  // set the max page size limit
  if (params.ps && params.ps > 1000) {
    params.ps = 1000;
  }

  // split out search items (eg. remove all non-search terms) and 
  // put them into the .search property of params
  var geoBox = _.pick(params, geoBoxKeys);
  var ignored = _.pick(params, ignoreAttributes);
  var search = _.omit(params, _.union(nonSearchParams, geoBoxKeys, ignoreAttributes));
  var searchKeys = _.keys(search);
  params = _.pick(params, nonSearchParams);
  params.search = search;

  //
  // Validate geobox values, if supplied.  We should have all of them and they
  // should be valid numbers.
  //
  
  var missingGeoboxKeysMsg, invalidGeoboxValuesMsg;
  
  if (_.keys(geoBox).length > 0) {
    
    // We have some geo box terms
    if (_.keys(geoBox).length == geoBoxKeys.length) {
      // We have all the terms
      var invalidValues = _.filter(geoBoxKeys, function(key) {
        // Todo: better lat/lon validation?
        var result = !geoBox[key] || isNaN(geoBox[key]);
        return result;
      });
      
      if (invalidValues.length > 0) {
        invalidGeoboxValuesMsg = 'Invalid geo search value(s): ' + invalidValues.join(', ');
      } else {
        params.geoBox = geoBox;
      }
    } else {
      var missingKeys = _.difference(geoBoxKeys, _.keys(geoBox));
      missingGeoboxKeysMsg = 'Missing geo search key(s): ' + missingKeys.join(', ');
    }
  }

  // validate the input values
  var attributes = _.isArray(i_attributes) ? i_attributes : _.keys(i_attributes);

  if (_.isString(params.s) && (attributes.indexOf(params.s) == -1) && params.s !== 'id') {
    cb({status:400, "msg": 'Invalid order field: '+params.s});

  } else if (_.isString(params.so) && (['asc','desc'].indexOf(params.so) == -1)) {
    cb({status:400, "msg": 'Invalid output order.'});

  } else if (invalidGeoboxValuesMsg || missingGeoboxKeysMsg) {
    cb({status: 400, "msg": invalidGeoboxValuesMsg || missingGeoboxKeysMsg});
    
  } else {
    // validate search values
    var invalidSearchField = _.find(searchKeys, function(searchField) {
      return _.isString(searchField) && (attributes.indexOf(searchField) == -1) && !_.contains(specialSearchFields, searchField);
    });

    var invalidSearchValue = _.find(_.values(params.search), function(searchValue) {
      return (searchValue != '%') && (searchValue.search(/[^A-Z_a-z0-9-,.:@\s]/) != -1);
    });

    if(!invalidSearchValue && params.search.$between) {
      // validate between value is two dates separated by a comma
      var dates = params.search.$between.split(',');
      if(dates.length !== 2 || isNaN(Date.parse(dates[0])) || isNaN(Date.parse(dates[1]))) {
        invalidSearchValue = params.search.$between;
      }
    }

    if(invalidSearchField) {
      cb({status:400, "msg": 'Invalid search field: ' + invalidSearchField + '.'});

    } else if(invalidSearchValue) {
      cb({status:400, "msg": 'Invalid search value: ' + invalidSearchValue + '.'});

    } else {
      // add the ignored fields back to the search params
      params = _.extend(params, ignored);
      cb(null, params);
    }
  }
}

exports.paramValidate = function (iURL, iSortorder, iSortfield, i_attributes, ignoreAttributes, cb) {
  // make ignoreAttributes optional
  if(_.isFunction(ignoreAttributes)) {
    cb = ignoreAttributes;
    ignoreAttributes = [];
  }

  if ((typeof(iURL) == "undefined") || _.isNull(iURL)) {
    cb({status:400, "msg": 'Invalid URI.'});

  } else {
    // assign default values
    var params = url.parse(iURL, true).query;
    queryValidateFunc(params, iSortorder, iSortfield, i_attributes, ignoreAttributes, cb);
  }
}

exports.queryValidate = function (iQuery, iSortorder, iSortfield, i_attributes, ignoreAttributes, cb) {
  // make ignoreAttributes optional
  if(_.isFunction(ignoreAttributes)) {
    cb = ignoreAttributes;
    ignoreAttributes = [];
  }

  queryValidateFunc(iQuery, iSortorder, iSortfield, i_attributes, ignoreAttributes, cb);
}

function cond2String(iTable, iConditions) {
  var i = 0;
  if (_.isEmpty(iConditions)) {
    return '0=0';

  } else if(iConditions.hasOwnProperty('rawSql')) {
    return iConditions.rawSql;

  } else {
    return(_.reduce(iConditions, function(rtn, val, key){
      i++;
      return rtn + ((i == 1) ? '' : ' and ')
        + ('\"'+iTable+'\".\"' + key +'\"')
        + ((val == null) ? ' is ' : ' = ')
        + (_.isString(val) ? "'" : "") + val + (_.isString(val) ? "'" : "");
    }, '') );
  }
}

exports.trimStringToLength = function(str, len, options) {
  options = options || {};
  var result = str;
  if (str) {
    if (str.length > len) {
      result = str.substr(0, len - 3) + '...';
    }
  }
  return result;
}

// $all - searches across all fields
// $between - searches between two dates against date or createdAt fields
function getWhereclause(iParams, iTable, iModel, iWhitelist, iLike, iConditions) {
  // default whitelist
  iWhitelist = iWhitelist ? iWhitelist : _.keys(iModel.rawAttributes);

  // get whereclause
  var whereclause = cond2String(iTable, iConditions);

  // is this ever used?
  var useWhereclause = _.every(_.values(iParams.search), function(searchTerm) {
    return searchTerm === '%';    
  });

  // given a key and value push the appropriate sql to the array to create the where clause
  function generateSqlSnippet(key, value) {
    var snippet;

    if (_.isArray(value)) {
      snippet = '"' + iTable + '"."' + key + '" IN (' + value.join() + ')';
    } else if (!iModel.rawAttributes[key]) {
      throw 'Oops, key "' + key + '" does not exist in model "' + iModel.name + '"';
    } else if (iModel.rawAttributes[key].type.type === 'JSON') {
      // Enjoy the hack!
      snippet = value.rawJson;
    } else if (
      ((typeof iModel.rawAttributes[key].type === 'function') && !_.isUndefined(iModel.rawAttributes[key].type._typeName) &&
        iModel.rawAttributes[key].type._typeName == 'VARCHAR')
        && iLike > 0
      ) {
      snippet = "lower(\"" + iTable + "\".\"" + key + "\") like '" +
        ((iLike == 1 || iLike == 3) ? '%' : '') + value.toLowerCase() +
        ((iLike == 2 || iLike == 3) ? '%' : '') + "'";

    } else if (value === 'null' && !_.isUndefined(iModel.rawAttributes[key].type._typeName) &&
      iModel.rawAttributes[key].type._typeName === 'INTEGER') {
      // use IS NULL instead of = 'null' (for INTEGER fields for now)
      snippet = "\"" + iTable + "\".\"" + key + "\" IS NULL";
    } else {
      snippet = "\"" + iTable + "\".\"" + key + "\" = \'" + value + "\'";
    }

    return snippet;
  }

  if (useWhereclause) {
    return whereclause;

  } else {
    var searchWhereClause = [whereclause];
    var tokenClause;
    var betweenClause;
    var orClause;

    _.each(_.keys(iParams.search), function(key) {
      console.log(key);

      if(!_.contains(specialSearchFields, key)) {
        searchWhereClause.push(generateSqlSnippet(key, iParams.search[key]));
      }
    });

    if (iParams.search.$all) {
      var tokenClauses = [];
      // tokenize the search phrase
      var phrase = iParams.search.$all.replace(/\s+/g, ' ');

      // iterate and create sql
      _.each(phrase.split(' '), function(searchToken) {
        tokenClauses.push( "(" +
          _.reduce( 
            _.filter( iWhitelist, function(item) {
              if (_.isUndefined(iModel.rawAttributes[item]) || _.isUndefined(iModel.rawAttributes[item].type)) {
                return false;

              } else if (!_.isUndefined(iModel.rawAttributes[item].type._typeName)) {
                return (iModel.rawAttributes[item].type._typeName == 'VARCHAR' ||
                  iModel.rawAttributes[item].type._typeName == 'INTEGER');

              } else {
                return false;
              }
            }), function(clause, item) {
              var sql = clause;
              switch(iModel.rawAttributes[item].type._typeName) {
                case 'VARCHAR':
                  sql += " OR lower(\""+ iTable +"\".\"" + item + "\") like '%" + searchToken.toLowerCase() + "%'";
                  break;
                case 'INTEGER':
                  // only search an integer if the search token is a number
                  if(isNumber(searchToken)) {
                    sql += " OR \""+ iTable +"\".\"" + item + "\" = " + searchToken;
                  }
                  break;
              }
              return sql;
            }, null
          ) + ')');
      });
      tokenClause = "("+_.compact(tokenClauses).join(" OR ")+")";
    }

    if (iParams.search.$between) {
      // handle the between clause
      var betweenField = _.contains(iWhitelist, 'date') ? '"' + iTable + '".date' : '"' + iTable + '"."createdAt"';
      var dates = iParams.search.$between.split(',');
      betweenClause = "(" + betweenField + " >= '" + dates[0] + "' AND " + betweenField + " < '" + dates[1] + "')";
    }

    if (iParams.search.$or) {
      // handle the or clause by OR-ing each item in $or
      orClause = '(';

      for(var i = 0; i < iParams.search.$or.length; i++) {
        var keys = _.keys(iParams.search.$or[i]);
        for(var j = 0; j < keys.length; j++) {
          if(_.contains(iWhitelist, keys[j])) {
            orClause += '(';
            orClause += generateSqlSnippet(keys[j], iParams.search.$or[i][keys[j]]);
            if(j < keys.length - 1) {
              orClause += ' AND ';
            }
            orClause += ')';
          }
        }
        if(i < iParams.search.$or.length - 1) {
          orClause += ' OR ';
        }
      }

      orClause += ')';
    }

    return _.compact([
      searchWhereClause.join(' AND '),
      tokenClause,
      betweenClause,
      orClause
    ]).join(' AND ');
  }
}

exports.sqlCount = function(iParams, iTable, iModel, iWhitelist, iLike, iConditions, iInclude, cb) {
  // make iInclude optional
  if(_.isFunction(iInclude)) {
    cb = iInclude;
    iInclude = null;
  }

  var query = {
    where: getWhereclause(iParams, iTable, iModel, iWhitelist, iLike, iConditions)
  };

  if(iInclude) {
    query.include = iInclude;
  }

  iModel.count(query).success(function(result) {
    cb(null, result);

  }).error(function(err) {
    cb({status:500, "msg": friendlyError(err)});
  });
}

exports.sqlSelect = function(iParams, iTable, iModel, iWhitelist, iLike, iConditions, iInclude, cb) {
  var query= {
    where: getWhereclause(iParams, iTable, iModel, iWhitelist, iLike, iConditions),
    offset: ((iParams.p - 1) * iParams.ps),
    limit: iParams.ps  
  };

  // sort 
  if (/^[A-Z]/.test(iParams.s)) {
//    query.order = iParams.s + ' ' + iParams.so;
    query.order = [ [ iParams.s , iParams.so ] ];
  } else {
//    query.order = iTable + '.' + iParams.s + ' ' + iParams.so;
    query.order = [ [ iTable + '.' + iParams.s , iParams.so ] ];
  }

  // whitelist
  if (iWhitelist) {
    query['attributes'] = _.intersection(iWhitelist, _.keys(iModel.attributes));
  }

  // includes
  if (iInclude) {
    query['include'] = iInclude;
  }

  iModel.findAll(query).success(function(result) {
    if (result) {
      cb(null, result)
    } else {
      cb({status:404});
    }
  }).error(function(err) {
    cb({status:500, "msg": friendlyError(err)});
  });
}

exports.rawGenerateWhere = function(params, inputs) {
  // generates the where sql statement and updates inputParams with any fields we want to plug into the sql statement
  // example: params.search.featured = true will include sql "featured = ?" while adding true to the inputParams
  var where = '';

  // loop through each key
  _.each(_.keys(params.search), function(key) {
    where += 'and ' + key + ' = ? ';

    // either case will need to push the value into the inputParams
    inputs.push(params.search[key]);
  });

  return where;
};

exports.rawGenerateOrderByLimitOffset = function(params) {
  return ' order by "' + params.s + '" ' + params.so +
    ' limit ' + params.ps + ' offset ' + ((params.p - 1) * params.ps);
};

var friendlyError = function(sequelizeError) {
  if (sequelizeError instanceof Error) {
    console.trace(sequelizeError.message);
    return sequelizeError.message;
  } else {
    return sequelizeError;
  }
};

exports.friendlyError = friendlyError;

//
// Call the validate() method on a model and return a friendly error message
// describing the first invalid field, if possible
// 
exports.validateModelValues = function(model, values) {
  var errmsg = model.build(values).validate();
  var result;
  
  if (errmsg) {
    result = require('util').inspect(errmsg);
    var errArray = _.values(errmsg);
    if (errArray && errArray.length > 0) {
      var errMsg = '' + errArray[0];
      if (errMsg) {
        var errFieldMatch = errMsg.match(/failed: *(.*)/);
        if (errFieldMatch) {
          result = 'Invalid value for "' + errFieldMatch[1] + '"';
        }
      }
    }
  }

  return result;
}

// if count is not passed in, increment the count by 1
exports.updateCount = function(sequelize, validCountFields, table, id, field, count, cb) {
  var increment = _.isFunction(count);
  cb = increment ? count : cb;

  if(!_.find(validCountFields, function(currentField) {
    return currentField === field;
  })) {
    cb('invalid count field passed into updateCount: ' + field, '(valid fields:', validCountFields, ')');
  } else {
    var query, params;

    if(increment) {
      query = 'update "' + table + '" set "' + field + '" = coalesce("' + field + '", 0) + 1, "updatedAt" = now() where id = ?';
      params = [id];
    } else {
      query = 'update "' + table + '" set "' + field + '" = ?, "updatedAt" = now() where id = ?';
      params = [count, id];
    }

    sequelize.query(query, null, {raw: true}, params).success(function()  {
      cb();
    }).error(function(err) {
        cb(err);
      });
  }
};

//
// Returns the result in seconds, or -1 if something went wrong.
//
exports.ISO8601DurationToSeconds = function(origDuration) {
  //
  // https://en.wikipedia.org/wiki/ISO_8601#Durations
  //
  // The time parts should be sufficient for our use case, but the Y/M/D remains
  // insufficiently tested.
  //
  var parts = origDuration.toUpperCase().match(/^P([0-9\.]*Y)?([0-9\.]*M)?([0-9\.]*D)?(T?)([0-9\.]*H)?([0-9\.]*M)?([0-9\.]*S)?$/i);
  var valid = true;
  if (parts && parts.length > 3) {
    parts = parts.slice(1);
    var mults = [{
      Y: 365 * 24 * 60 * 60,
      M: 30 * 24 * 60 * 60,   // todo: determine if this one for month is accurate?  Hard to find info about it.
      D: 24 * 60 * 60,
    }, {
      H: 60 * 60,
      M: 60,
      S: 1
    }];
    var interimResult = _.reduce(parts, function(memo, value) {
      if (value) {
        if (value === 'T') {
          memo.section = 1;
        } else {
          var digitsAndType = value.match(/([0-9\.]*)([A-Z])/);
          if (digitsAndType.length == 3 && mults[memo.section][digitsAndType[2]]) {
            memo.sum += digitsAndType[1] * mults[memo.section][digitsAndType[2]];
          } else {
            console.log('oops, something bad: ' + digitsAndType.length + ', ' + digitsAndType[2] + ', ' + mults[memo.section][digitsAndType[2]]);
            valid = false;
          }
        }
      }
      return memo;
    }, { section: 0, sum: 0 });
  } else {
    valid = false;
  }

  return (valid ? interimResult.sum : -1);
};

//
// Grab the object item an arbitrary number of levels deep without risking an 'undefined' error
//
// Example:
//      var s1 = { hello: { there: { it: { exists: true } } } };
//      if (s1.hello.notthere.it.exists) { ... }                  // has exception
//      if (safeTraverse(s1, 'hello.notthere.it.exists')) { ... }   // just fine
//
exports.safeTraverse = function(source, pathStr) {
  return _.reduce(pathStr.split('.'), function(memo, value) {
    if (memo.result) {
      memo.result = memo.current = (memo.current ? memo.current[value] : undefined);
    }
    return memo;
  }, { result: true, current: source }).result;
}

