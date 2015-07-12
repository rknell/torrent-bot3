angular.module('www').factory('chromecast', function ($http, $interval, $rootScope, socketIo) {


  function load(url, device, title, image) {
    console.log("casting", url, device, title, image);
    //return $http.post('/chromecasts/play', {
    //  url: url,
    //  device: device,
    //  title: title,
    //  image: image,
    //  socketId: $rootScope.socketId
    //});
    socketIo.emit("chromecast:load", {
      url: url,
      device: device,
      title: title,
      image: image
    });
  }

  function stop() {
    //return $http.get('/chromecasts/stop');
    socketIo.emit("chromecast:stop");
  }

  function pause() {
    //return $http.get('/chromecasts/pause');
    socketIo.emit("chromecast:pause");
  }

  function seek(time) {
    //return $http.post("/chromecasts/seek");
    socketIo.emit("chromecast:seek", time);
  }

  function play() {
    //return $http.get('/chromecasts/play');
    socketIo.emit("chromecast:play");
  }

  function volumeUp() {
    //return $http.get("/chromecasts/volumeUp");
    socketIo.emit("chromecast:volumeUp");
  }

  function volumeDown() {
    //return $http.get("/chromecasts/volumeDown");
    socketIo.emit("chromecast:volumeDown");
  }

  socketIo.on("chromecast:found", function (device) {
    console.log("Found chromecast", device);
    chromecast.chromecasts.push(device);
  });

  socketIo.on("welcome", function(data){
    console.log("Setting known chromecasts", data.chromecasts);
    chromecast.chromecasts = data.chromecasts;
  });

  var chromecast = {
    chromecasts: [],
    play: play,
    stop: stop,
    pause: pause,
    seek: seek,
    load: load,
    volumeUp: volumeUp,
    volumeDown: volumeDown
  };

  return chromecast;
});