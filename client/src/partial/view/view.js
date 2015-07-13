angular.module('www').controller('ViewCtrl', function ($scope, $rootScope, $http, $sce, library, $state, chromecast, $timeout, socketIo, $interval) {
  var url;
  var lib = $rootScope.library;
  var file;

  $scope.infoBoxShown = true;

  $rootScope.current = $rootScope.library.shows[$state.params.name];
  file = lib.shows[$state.params.name].seasons[$state.params.season][$state.params.episode].sources[$state.params.index];

  $scope.playLocal = function () {

    file = lib.shows[$state.params.name].seasons[$state.params.season][$state.params.episode].sources[$state.params.index];
    $scope.action = "playVideo";
    console.log("Emitting torrent:stream", {url: file.magnetUri})
    socketIo.emit("torrent:stream", {url: file.magnetUri});
    socketIo.on("torrent:stream", function (result) {
      console.log("Got torrentstream", result);
      url = result.videoUrl;
      $scope.videoSource = $sce.trustAsResourceUrl(result.videoUrl);
      $scope.$apply();
    });
  };

  socketIo.on('torrent:status', function (status) {
    $scope.status = status;
    $scope.$apply();
  });

  $scope.playChromecast = function playChromecast(player) {
    $scope.action = "chromecast";
    $scope.canPlay = true;

    file = lib.shows[$state.params.name].seasons[$state.params.season][$state.params.episode].sources[$state.params.index];
    socketIo.emit("torrent:stream", {url: file.magnetUri});

    socketIo.on("torrent:stream", function (result) {
      url = result.videoUrl;
      chromecast.load(url, player.addresses[0], $state.params.name + " S" + $state.params.season + "E" + $state.params.episode, lib.shows[$state.params.name].info.backdrop_path);
    });

    socketIo.on("chromecast:status", function (result) {
      console.log("chromecast status", result);
      if(result.media){
        $scope.duration = result.media.duration;

      }

      if(result.currentTime){
        $scope.currentTime = result.currentTime;
      }
      $scope.$apply();
    });
  };

  $scope.chromecasts = chromecast;

  if (chromecast.chromecasts.length) {
    $scope.action = "selectMethod";
  } else {
    $scope.playLocal();
  }

  $scope.stop = function () {
    chromecast.stop();
  };

  $scope.pause = function () {
    chromecast.pause();
  };

  $scope.seek = function (time) {
    console.log("seek", time);
    //chromecast.seek(time);
  };

  $scope.play = function () {
    chromecast.play();
  };

  $scope.volumeUp = function () {
    chromecast.volumeUp();
  }

  $scope.volumeDown = function () {
    chromecast.volumeDown();
  }

  $interval(function incrementTime(){
    $scope.currentTime ++;
    //document.getElementById('myVideo')
  }, 1000);

  document.getElementById('player').addEventListener('canplay', function(data){
    console.log("canplay", data);
    $scope.canPlay = true;
    $scope.$apply();
  })

});
