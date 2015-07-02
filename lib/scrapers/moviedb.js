/*
 * Module dependencies
 */
'use strict'
var request = require('request');
var endpoints = require('./endpoints.json');
var q = require('q');

var api_key = '75b5199b3ca7adaee206a1698fd99cf0';

///*
// * Exports the constructor
// */
//

var MovieDBObj = TMDB(api_key);

function TMDB(api_key, base_url) {
  if (api_key) {
    return new MovieDB(api_key, base_url);
  } else {
    throw new Error('Bad api key');
  }
}


//
//
//
///*
// * Constructor
// */
//
function MovieDB(api_key, base_url) {
  this.api_key = api_key;
  if (base_url) endpoints.base_url = base_url;
  return this;
}

/*
 * API auth
 */
var token;
MovieDB.prototype.requestToken = function () {
  var deferred = q.defer();
  var self = this;

  request.get(endpoints.base_url + endpoints.authentication.requestToken + "?api_key=" + api_key, function (err, res, body) {
    if (err) {
      deferred.reject(err);
    } else {
      token = JSON.parse(body);
      deferred.resolve()
    }
  });

  return deferred.promise;
};

/*
 * Generate API methods
 */

Object.keys(endpoints.methods).forEach(function (method) {
  var met = endpoints.methods[method];
  Object.keys(met).forEach(function (m) {
    MovieDB.prototype[method + m] = function (params, fn) {
      var deferred = q.defer();

      if (!token || Date.now() > +new Date(token.expires_at)) {
        this.requestToken()
          .then(function () {
            return execMethod(met[m].method, params, met[m].resource)
              .then(deferred.resolve)
              .catch(deferred.reject);
          });
      } else {
        execMethod(met[m].method, params, met[m].resource)
          .then(deferred.resolve)
          .catch(deferred.reject);
      }

      return deferred.promise;
    };
  });
});

var execMethod = function (type, params, endpoint) {
  var deferred = q.defer();
  params = params || {};
  endpoint = endpoint.replace(':id', params.id).replace(':season_number', params.season_number).replace(':episode_number', params.episode_number);
  type = type.toUpperCase();

  var qs, body;
  if (type === 'GET') {
    qs = params;
  }
  else {
    body = params
  }
  qs.api_key = api_key;

  request({
    method: type,
    uri: endpoints.base_url + endpoint,
    qs: qs,
    form: body
  }, function (err, res, body) {
    if (err) {
      deferred.reject(err);
    } else {
      var data = JSON.parse(body);

      if (data.status_code === 25) {
        console.log("MovieDB Retrying...");
        setTimeout(function () {
          execMethod(type, params, endpoint)
            .then(deferred.resolve)
            .catch(deferred.reject)
        }, 10000)
      } else {
        deferred.resolve(data);
      }
    }
  });

  return deferred.promise;
};

var tmdbConfig;
function getTMDBConfig() {
  if (!tmdbConfig) {
    return MovieDBObj.configuration()
      .then(function (result) {
        tmdbConfig = result;
        return q(tmdbConfig);
      })
  } else {
    var deferred = q.defer();
    deferred.resolve(tmdbConfig);
    return deferred.promise;
  }
}

function getTMDBData(showName, season, episode) {
  //var deferred = q.defer();
  var showRes, episodeRes;
  return getTMDBConfig()
    .then(function () {
      return MovieDBObj.searchTv({query: showName})
    })
    .then(function (_showRes) {
      showRes = _showRes;
      if (showRes.results && showRes.results[0]) {
        showRes.results[0]['backdrop_path'] = tmdbConfig.images['base_url'] + 'w1280' + showRes.results[0]['backdrop_path'];
        showRes.results[0]['poster_path'] = tmdbConfig.images['base_url'] + 'w342' + showRes.results[0]['poster_path'];

        return MovieDBObj.tvEpisodeInfo({
          season_number: season,
          episode_number: episode,
          id: showRes.results[0].id
        });
      } else {
        return q()
      }

    })
    .then(function (_episodeRes) {
      episodeRes = _episodeRes;
      if (episodeRes) {
        episodeRes["still_path"] = tmdbConfig.images['base_url'] + 'w300' + episodeRes["still_path"]
      }

      var showResResult;
      if (showRes.results) {
        showResResult = showRes.results[0];
      }

      return q({
        showRes: showResResult,
        episodeRes: episodeRes
      })
    });
}

function setAPIKey(_api_key) {
  api_key = _api_key;
}

module.exports = {
  search: getTMDBData,
  api: MovieDBObj,
  api_key: setAPIKey
};