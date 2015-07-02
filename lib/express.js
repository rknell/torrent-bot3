var express = require('express');
var torrentController = require('./torrent-controller2');
var bodyParser = require('body-parser');
var showRss = require('./scrapers/showRss');
var path = require('path');
var data = require('./scrapers/data');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var engine;
app.post('/play', function (req, res) {
  if (engine) {
    //Stop the current download
    engine.stop();
  }

  engine = torrentController(req.body.url, function (status, update) {
    console.log(status, update);
    res.json({
      videoUrl: status.href,
      filename: status.filename
    })
  })
});

app.get('/stop', function (req, res) {
  engine.stop();
});

app.get('/showRss', function (req, res) {
  showRss.fetch("http://showrss.info/feeds/all.rss")
    .then(function (result) {
      res.json(result);
    })
});

app.get('/library', function(req, res){
  //var db = require('../db.json');
  //res.json(db);
  res.sendFile("db.json", {
    root: __dirname + "/../"
  });
})

app.use(express.static(path.join(__dirname, "..", "www")));

app.listen(8185, function (err) {
  console.log("App listening on port 8185");
});