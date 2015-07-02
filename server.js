var kickass = require('./lib/scrapers/kickassTV');
var showRss = require('./lib/scrapers/showRSS');
var path = require('path');

//Create a global variable DB path for use throughout the app
dbPath = path.join(__dirname, "db.json");

function loopKickass() {
  kickass.scrapeAndSaveAll()
    .then(function () {
      setTimeout(loopKickass, 1000 * 60 * 60 * 4);
    })
    .catch(function (err) {
      console.log(err.stack);
    });
}

function loopShowRSS() {
  showRss.updateAndSave()
    .then(function () {
      setTimeout(loopShowRSS, 1000 * 60 * 5);
    })
    .catch(function (err) {
      console.log(err.stack);
    });
}

loopKickass();
loopShowRSS();