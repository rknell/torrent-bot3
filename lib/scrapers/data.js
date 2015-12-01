/*global  dbPath */
'use strict';
var fs = require('fs');
var q = require('q');
var moviedb = require('./moviedb');

var saving = false;
var saveQueue = false;
function save() {

  var deferred = q.defer();

  if (!saving) {
    saving = true;
    saveQueue = false;
    getDB().then(function (db) {
      fs.writeFile(dbPath + ".tmp", JSON.stringify(db), function (err) {
        if (err) {
          deferred.reject(err);
        } else {
          fs.rename(dbPath + ".tmp", dbPath, function (err) {
            saving = false;
            if (saveQueue) {
              save().then(deferred.resolve);
            } else {
              deferred.resolve();
            }
          });
        }

      });
    });
  } else {
    saveQueue = true;
    deferred.resolve();
  }

  return deferred.promise;
}

function saveEpisode(showName, showSeason, showEpisode, magnetUri, quality, originalName) {
  var deferred = q.defer();
  showSeason = String(showSeason);
  showEpisode = String(showEpisode);

  getDB().then(function (db) {
    if (!db.shows) {
      console.log("Db.shows does not exist, reinit");
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

    if (!found && magnetUri) {
      moviedb.search(showName, showSeason, showEpisode)
        .then(function (tmdbData) {
          if (!tmdbData.showRes) {
            console.log("No TMDB data", showName, showSeason, showEpisode);
            delete db.shows[showName];
            return save();
          }
          if (tmdbData.episodeRes) {
            db.shows[showName].info = tmdbData.showRes;
            db.shows[showName].seasons[showSeason][showEpisode].info = tmdbData.episodeRes;

            db.shows[showName].seasons[showSeason][showEpisode].sources.push({
              magnetUri: magnetUri,
              quality: quality,
              originalName: originalName
            });

            var recentEp;
            db.recentEpisodes.forEach(function (episode) {
              if (episode.name === showName && episode.episode === showEpisode && episode.season === showSeason) {
                recentEp = episode;
              }
            });

            process.send({type: "added:show", data: {name: showName, data: db.shows[showName]}});

            if (!recentEp) {
              var recentEpData = {
                name: showName,
                episode: showEpisode,
                season: showSeason,
                posterPath: tmdbData.showRes.poster_path,
                addedDate: new Date(),
                airDate: tmdbData.episodeRes.air_date || new Date()
              };

              db.recentEpisodes.push(recentEpData);
              process.send({type: "added:recentEpisode", data: recentEpData});
              //process.send("added:recentEpisode", recentEpData);
            }

            return save();
          }

          return q();

        })
        .then(deferred.resolve)
        .catch(deferred.reject);
    } else {
      //Just return a promise but do nothing.
      deferred.resolve();
    }
  }).catch(function (err) {
    console.error(err.stack);
    deferred.reject(err);
  });

  return deferred.promise;
}

var db;
function getDB() {
  var deferred = q.defer();

  if (db) {
    deferred.resolve(db);
  } else {
    db = JSON.parse(fs.readFileSync(dbPath, {encoding: "UTF8"}));
    deferred.resolve(db);
  }

  return deferred.promise;
}

module.exports = {
  saveEpisode: saveEpisode,
  db: db
};