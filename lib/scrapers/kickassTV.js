var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var q = require('q');
var data = require('./data');
var parseShowData = require('./parseShowData');
q.longStackSupport = true;

function getPage(number) {
  console.log("Processing Kickass TV Shows Page", number);

  var deferred = q.defer();

  request({
    method: 'GET'
    , uri: "http://kickass.to/tv/" + number
    , gzip: true
  }, function (err, res, body) {
    try {
      var $ = cheerio.load(body);
      var rows = $('table').find('tr');

      var items = [];
      rows.each(function (index, element) {
        var output = {
          title: $(this).find('.cellMainLink').text(),
          size: $(this).find('.nobr.center').text(),
          magnetLink: $(this).find('.imagnet').attr('href')
        };
        if (output.title && output.title.length < 500 && output.title.length > 10) {
          items.push(output);
        }
      });

      var outstanding = [];

      async.eachLimit(items, 60, function (item, cb) {
        outstanding.push(item.title);
        if (item.title === "The Last Man On Earth S01E01 HDTV x264-KILLERS[ettv]") {
          var a = 0;
        }

        var timeoutId = setTimeout(function () {
          console.log("Timing out", item.title);
          outstanding.splice(outstanding.indexOf(item.title), 1);
          cb();
        }, 1000 * 15);

        feeds.addSingleShow(item.title, item.magnetLink, item.size)
          .then(function () {
            console.log("Added", item.title);
          })
          .finally(function () {
            //console.log("Finished processing", item.title);
            outstanding.splice(outstanding.indexOf(item.title), 1);
            clearTimeout(timeoutId);
            cb();
          });
      }, function (err) {
        setTimeout(deferred.resolve, 5000);
      });

      function outstandingFn() {
        setTimeout(function () {
          if (outstanding.length) {
            console.log("Outstanding", JSON.stringify(outstanding, null, 2));
            outstandingFn();
          }
        }, 1000 * 30);
      }

      outstandingFn();
    } catch (e) {
      console.error("Could not process page", number, "scrape issue.", e, e.stack);
      console.log(body);
      deferred.resolve();
    }
  });

  return deferred.promise;
}

function processShows() {
  var pages = [];

  for (var i = 1; i < 400; i++) {
    pages.push(i);
  }

  async.eachLimit(pages, 1, function (item, cb) {
    getPage(item)
      .then(function (result) {
        //console.log("Processed page", item);

      })
      .catch(function (err) {
        console.error("Error processing show page", err.stack);
      })
      .finally(function (result) {
        //setTimeout(cb, 1000 * 60);
        cb();
      })
  }, function (done) {
    console.log("Processed all shows, starting again.");
    setTimeout(processShows, 1000 * 60 * 15);
  })
}

function scrape(page) {
  var deferred = q.defer();
  request({
    method: 'GET'
    , uri: "http://kickass.to/tv/" + page
    , gzip: true
  }, function (err, res, body) {
    if (err) {
      deferred.reject(err);
    } else if (res.statusCode !== 200) {
      deferred.reject(res)
    } else {
      var $ = cheerio.load(body);
      var rows = $('table').find('tr');

      var items = [];
      rows.each(function (index, element) {
        var output = {
          title: $(this).find('.cellMainLink').text(),
          size: $(this).find('.nobr.center').text(),
          magnetLink: $(this).find('.imagnet').attr('href')
        };
        if (output.title && output.title.length < 500 && output.title.length > 10) {
          items.push(output);
        }
      });

      deferred.resolve(items);
    }
  });

  return deferred.promise;
}

function scrapeAndSave(page) {
  return scrape(page)
    .then(function (results) {
      var saves = [];
      results.forEach(function(item){
        var parsedShow = parseShowData.parse({
          title: item.title,
          magnetUri: item.magnetLink
        });
        if(parsedShow){
          saves.push(data.saveEpisode(parsedShow.name,parsedShow.season, parsedShow.episode, parsedShow.magnetUrl, parsedShow.quality, parsedShow.originalName))
        }
      });
      return q.all(saves)
    })
}

function scrapeAndSaveAll(limit){
  var deferred = q.defer();
  var pages = [];

  if(!limit){
    limit = 400;
  }

  for(var i = 1; i <= limit; i++){
    console.log("pushing", i);
    pages.push(i);
  }

  async.eachLimit(pages, 1, function(page, cb){
    console.log("Scraping", page);
    scrapeAndSave(page)
      .then(function(){
        cb();
      })
      .catch(cb);
  }, function(err){
    if(err){
      deferred.reject(err);
    } else {
      deferred.resolve();
    }

  });

  return deferred.promise;
}

module.exports = {
  processShows: processShows,
  scrape: scrape,
  scrapeAndSave: scrapeAndSave,
  scrapeAndSaveAll: scrapeAndSaveAll
};