var express = require('./lib/express');
var child_process = require('child_process');
var path = require('path');

dbPath = path.join(__dirname, "db.json");
server = child_process.fork(path.join(__dirname, 'server.js'));

server.on("message", function (message) {
  if (message.type === "added:show") {
    io.emit('added:show', message.data);
    console.log("added:show", message);
  }

  if (message.type === "added:recentEpisode") {
    io.emit('added:recentEpisode', message.data);
    console.log("added:recentEpisode", message);
  }

});