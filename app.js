var express = require('./lib/express');
var server = require('./server');

// server.on("message", function (message) {
//   if (message.type === "added:show") {
//     io.emit('added:show', message.data);
//     console.log("added:show", message);
//   }
//
//   if (message.type === "added:recentEpisode") {
//     io.emit('added:recentEpisode', message.data);
//     console.log("added:recentEpisode", message);
//   }
//
// });