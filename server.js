console.log("Launched Server");
var kickass = require('./lib/scrapers/kickassTV');
var showRss = require('./lib/scrapers/showRSS');
var path = require('path');

//Create a global variable DB path for use throughout the app
dbPath = path.join(__dirname, "db.json");
console.log("dbPath", dbPath);
console.log(__dirname);

function loopKickass() {
  kickass.scrapeAndSaveAll()
    .then(function () {
      setTimeout(loopKickass, 1000 * 60 * 15);
    })
    .catch(function (err) {
      console.log(err.stack);
      setTimeout(loopKickass, 1000 * 60 * 5);
    });
}

function loopShowRSS() {
  showRss.updateAndSave()
    .catch(function (err) {
      console.log(err.stack);
      //setTimeout(loopShowRSS, 1000 * 60 * 5);
    })
    .finally(function () {
      setTimeout(loopShowRSS, 1000 * 60 * 5);
    });
}

loopKickass();
loopShowRSS();

//process.on("message", function(m){
//  console.log("Got message", m);
//  hello();
//});
//
//function hello(){
//  process.send("hello!");
//}
