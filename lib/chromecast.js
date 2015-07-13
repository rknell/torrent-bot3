//Chromecast requirements
var Client = require('castv2-client').Client;
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
var mdns = require('mdns');
var browser = mdns.createBrowser(mdns.tcp('googlecast'));
var q = require('q');

var noop = function () {
};

function load(url, deviceIP, title, image, socket) {
  var deferred = q.defer();

  var client;
  var player;

  client = new Client();
  client.volume = 0.5;

  client.volumeUp = function () {
    client.volume = ((client.volume * 10) + 1) / 10;
    client.setVolume({level: client.volume}, noop);
  };

  client.volumeDown = function () {
    client.volume = ((client.volume * 10) - 1) / 10;
    client.setVolume({level: client.volume}, noop);
  };

  console.log("chromecast:load", url, deviceIP, title, image, socket);

  client.connect(deviceIP, function () {
    console.log('connected, launching app ...');

    client.launch(DefaultMediaReceiver, function (err, _player) {
      if(!err) {
        player = _player;
        var media = {

          // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
          contentId: url,
          contentType: 'video/mp4',
          streamType: 'BUFFERED', // or LIVE

          // Title and cover displayed while buffering
          metadata: {
            type: 0,
            metadataType: 0,
            title: title || "Loading Video...",
            images: [
              {url: image}
            ]
          }
        };

        player.on('status', function (status) {
          console.log('status broadcast playerState=%s', status.playerState);
          socket.emit("chromecast:status", status);
        });

        console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId);

        player.load(media, {autoplay: true}, function (err, status) {
          console.log('media loaded playerState=%s', JSON.stringify(status, null, 2));
          socket.emit("chromecast:status", status);

          client.setVolume({level: client.volume}, noop);
          deferred.resolve({status: status, player: player, client: client});

        });
      } else {
        //Sometimes there might be an error if something is cancelled etc, try again.
        console.error(err);
        load(url, deviceIP, title, image, socket)
          .then(deferred.resolve);
      }


    });

  });

  client.on('error', function (err) {
    console.log('Error: %s', err.message);
    client.close();
  });

  return deferred.promise;
}

browser.on('serviceUp', function (service) {
  console.log("Service up");
  var found = false;
  output.devices.forEach(function (device) {
    if (device.name === service.name) {
      found = true;
    }
  });

  if (!found) {
    output.devices.push(service);
    io.emit("chromecast:found", service);
  }
  console.log('found device "%s" at %s:%d', service.name, service.addresses[0], service.port);
});

setTimeout(function(){
  browser.start();
}, 100);

var output = {
  load: load,
  devices: []
};

module.exports = output;