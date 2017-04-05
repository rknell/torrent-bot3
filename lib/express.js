var express = require('express');
var torrentController = require('./torrent-controller2');
var path = require('path');
var data = require('./scrapers/data');
var fs = require('fs');
var chromecast = require('./chromecast');
var db = require('./db');

var app = express();

var http = require('http').Server(app);
io = require('socket.io')(http);

app.get('/show/:showName', function (req, res) {
  db.allShows.findOne({name: req.params.showName})
    .exec(function (err, doc) {
      res.json(doc);
    });
})

io.on('connection', function (socket) {

  var chromecastObjects = {
    player: null,
    client: null
  };

  var torrentEngine;
  var reporter;

  fs.readFile(dbPath, {encoding: "UTF8"}, function (err, data) {

    db.recentShows.find({}).sort({date: -1}).limit(300).exec(function (err, recentEpisodes) {
      socket.emit('welcome', {
        message: 'Socket.IO connected',
        chromecasts: chromecast.devices,
        // library: JSON.parse(data),
        recentEpisodes: recentEpisodes
      });
    })
  });

  socket.on('send', function (data) {
    io.sockets.emit('message', data);
  });

  socket.on('disconnect', function () {
    if (torrentEngine) {
      torrentEngine.destroy();
      torrentEngine = undefined;
    }
  });

  socket.on('chromecast:play', function () {
    chromecastObjects.player.play();
  });

  socket.on('chromecast:stop', function () {
    chromecastObjects.player.stop();
  });

  socket.on('chromecast:pause', function () {
    chromecastObjects.player.pause();
  });

  socket.on('chromecast:load', function (data) {
    chromecast.load(data.url, data.device, data.title, data.image, socket)
      .then(function (result) {
        socket.emit("chromecast:status", result.status);
        chromecastObjects.player = result.player;
        chromecastObjects.client = result.client;
      })
  });

  socket.on('chromecast:seek', function (time) {
    console.log("seeking", time);
    chromecastObjects.player.seek(time);
  });

  socket.on('chromecast:volumeUp', function () {
    chromecastObjects.client.volumeUp();
  });

  socket.on('chromecast:volumeDown', function () {
    chromecastObjects.client.volumeDown();
  });

  socket.on('torrent:stream', function (data) {
    console.log("torrent:stream", data);

    if (torrentEngine) {
      //Stop the current download
      console.log("Destroying engine");
      torrentEngine.destroy();
    }

    torrentEngine = torrentController(data.url, function (status, update) {
      console.log(status, update);

      try {
        clearInterval(reporter);
      } catch (e) {

      }

      reporter = setInterval(function () {
        if (torrentEngine) {
          socket.emit("torrent:status", {
            downloadSpeed: status.downloadSpeed,
            totalPeers: status.totalPeers,
            downloaded: status.downloaded,
            uploaded: status.uploaded,
            filelength: status.filelength,
            wires: status.wires,
            hotswaps: status.hotswaps
          });
        }
      }, 1000);

      socket.emit("torrent:stream", {
        videoUrl: status.href,
        filename: status.filename,
        originalUrl: data.url,
        target: data.target
      });
    });

  })
});

app.use(express.static(path.join(__dirname, "..", "client", "dist")));

http.listen(process.env.PORT || 8185, function (err) {
  console.log("App listening on port " + process.env.PORT || 8185);
});