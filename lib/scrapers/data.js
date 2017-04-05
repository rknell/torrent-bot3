/*global  dbPath */
'use strict';
var fs = require('fs');
var q = require('q');
var path = require('path');
var moviedb = require('./moviedb');
var moment = require('moment');
var db = require('../db');

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

function saveRecent2(name, season, episode, date, posterUrl) {
  var deferred = q.defer();

  if (!date || moment(date).isAfter(moment())) {
    date = moment().format('YYYY-MM-DD');
  }

  db.recentShows.insert({
    name: name,
    season: season,
    episode: episode,
    date: date,
    posterUrl: posterUrl
  }, function (err) {
    if (err) {
      console.error(err);
    }
    deferred.resolve();
  });

  return deferred.promise;
}

function saveEpisode2(show) {

  var deferred = q.defer();

  db.allShows.findOne({name: show.name}, function (err, doc) {
    if (err) {
      deferred.reject("Error Searching", err);
    } else if (!doc) {
      //New Show, add it to the database
      moviedb.search(show.name, show.season, show.episode)
        .then(function (tmdbResult) {
          if (!tmdbResult.showRes) {
            console.log("No TMDB data for ", show.name);
            deferred.resolve();
          } else {
            db.allShows.insert({
              name: show.name,
              seasons: [{
                number: show.season,
                episodes: [{
                  number: show.episode,
                  tmdb: tmdbResult.episodeRes,
                  sources: [{
                    magnetUri: show.magnetUrl,
                    quality: show.quality,
                    format: show.format[0],
                    originalName: show.originalName
                  }]
                }]
              }],
              tmdbData: tmdbResult.showRes
            }, function (err) {
              deferred.resolve();
              if (err) {
                console.error("Error Inserting Show", err);
              } else {
                saveRecent2(show.name, show.season, show.episode, tmdbResult.episodeRes.air_date || show.airDate, tmdbResult.showRes.poster_path);
              }
            });
          }
        });

    } else {
      //Show exists
      if (show.magnetUrl) {
        db.allShows.findOne({"seasons.episodes.sources.magnetUri": show.magnetUrl}, function (err, magnetDoc) {
          if (err) {
            console.log("Error finding show magnet", show.name);
            deferred.resolve();
          } else if (!magnetDoc) {

            doc.seasons.forEach(function (season) {
              var foundSeason;
              if (season.number === show.season) {
                foundSeason = true;

                var foundEpisode;
                season.episodes.forEach(function (episode) {
                  if (episode.number === show.episode) {
                    foundEpisode = true;

                    episode.sources.push({
                      magnetUri: show.magnetUrl,
                      quality: show.quality,
                      format: show.format[0],
                      originalName: show.originalName
                    });

                    updateShow(doc).then(deferred.resolve);
                  }
                });

                if (!foundEpisode) {
                  moviedb.search(show.name, show.season, show.episode)
                    .then(function (tmdbResult) {
                      var data = {
                        number: show.episode,
                        sources: [{
                          magnetUri: show.magnetUrl,
                          quality: show.quality,
                          format: show.format[0],
                          originalName: show.originalName
                        }]
                      }
                      season.episodes.push(data);

                      saveRecent2(show.name, show.season, show.episode, tmdbResult.episodeRes.air_date || show.airDate, tmdbResult.showRes.poster_path);
                      updateShow(doc).then(deferred.resolve)
                    });
                }
              }

              if (!foundSeason) {
                moviedb.search(show.name, show.season, show.episode)
                  .then(function (tmdbResult) {
                    doc.seasons.push({
                      number: show.season,
                      episodes: [{
                        number: show.episode,
                        sources: [{
                          magnetUri: show.magnetUri,
                          quality: show.quality,
                          format: show.format,
                          originalName: show.originalName
                        }]
                      }]
                    });
                    saveRecent2(show.name, show.season, show.episode, tmdbResult.episodeRes.air_date || show.airDate, tmdbResult.showRes.poster_path);
                    updateShow(doc).then(deferred.resolve)
                  });
              }
            });
          } else {
            deferred.resolve();
          }
        });
      } else {
        deferred.resolve();
      }

    }
  });

  return deferred.promise;
}

function updateShow(doc) {
  var deferred = q.defer();
  db.allShows.update({_id: doc._id}, doc, function (err, num) {
    if (err) {
      console.error("Error saving show", err);
    }
    deferred.resolve();
  });

  return deferred.promise;
}

module.exports = {
  // saveEpisode: saveEpisode,
  saveEpisode2: saveEpisode2,
  db: db
};