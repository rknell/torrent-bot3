/*global  dbPath */
'use strict';
var fs = require('fs');
var q = require('q');
var moviedb = require('./moviedb');

var db = {};

db.save = function () {

  var deferred = q.defer();

  fs.writeFile(dbPath, JSON.stringify(db), function (err) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve();
    }

  });

  return deferred.promise;
};

function saveEpisode(showName, showSeason, showEpisode, magnetUri, quality, originalName) {
  var deferred = q.defer();
  showSeason = String(showSeason);
  showEpisode = String(showEpisode);

  if (!db.shows) {
    db.shows = {};
  }
  if (!db.shows[showName]) {
    db.shows[showName] = {
      info: {},
      seasons: {}
    };
  }
  if (!db.shows[showName].seasons[showSeason]) {
    db.shows[showName].seasons[showSeason] = {};
  }
  if (!db.shows[showName].seasons[showSeason][showEpisode]) {
    db.shows[showName].seasons[showSeason][showEpisode] = {
      sources: [],
      info: {}
    };
  }

  if (!db.recentEpisodes) {
    db.recentEpisodes = [];
  }

  var sources = db.shows[showName].seasons[showSeason][showEpisode].sources;

  var found = false;
  sources.forEach(function (source) {
    if (source.magnetUri === magnetUri) {
      found = true;
    }
  });

  if (!found) {
    moviedb.search(showName, showSeason, showEpisode)
      .then(function (tmdbData) {

        if (tmdbData.episodeRes) {
          db.shows[showName].info = tmdbData.showRes;
          db.shows[showName].seasons[showSeason][showEpisode].info = tmdbData.episodeRes;

          db.shows[showName].seasons[showSeason][showEpisode].sources.push({
            magnetUri: magnetUri,
            quality: quality,
            originalName: originalName
          });
          db.recentEpisodes.push({
            name: showName,
            episode: showEpisode,
            season: showSeason,
            magnetUri: magnetUri,
            quality: quality,
            originalName: originalName,
            addedDate: new Date(),
            airDate: tmdbData.episodeRes.air_date
          });

          return db.save();
        }

        return q();

      })
      .then(deferred.resolve)
      .catch(deferred.reject);
  } else {
    //Just return a promise but do nothing.
    deferred.resolve();
  }

  return deferred.promise;
}

function getDB() {
  var deferred = q.defer();

  fs.readFile(dbPath, function (err, data) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(data);
    }
  });

  return deferred.promise;
}

module.exports = {
  saveEpisode: saveEpisode,
  db: db
};