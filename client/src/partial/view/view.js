angular.module('www').controller('ViewCtrl', function ($scope, $rootScope, $http, $sce, library, $state, chromecast, $timeout, socketIo, $interval) {
  var url;
  var lib = $rootScope.library;
  var file;
  var startTime;

  $scope.infoBoxShown = true;

  $scope.playLocal = function () {
    // file = lib.shows[$state.params.name].seasons[$state.params.season][$state.params.episode].sources[$state.params.index];
    $scope.action = "playVideo";
    socketIo.emit("torrent:stream", {url: $state.params.magnetUri, target: "local"});
  };

  socketIo.on('torrent:status', function (status) {
    $scope.status = status;
    $scope.$apply();
  });

  socketIo.on("torrent:stream", function (result) {
    if (result.target === "local") {
      url = result.videoUrl;
      $scope.videoSource = $sce.trustAsResourceUrl(result.videoUrl);
      $scope.$apply();
    } else {
      //Must be a url so chromecast
      url = result.videoUrl;
      chromecast.load(url, result.target, $state.params.name + " S" + $state.params.season + "E" + $state.params.episode, lib.shows[$state.params.name].info.backdrop_path);
    }
  });

  $scope.playChromecast = function playChromecast(player) {
    $scope.action = "chromecast";
    $scope.canPlay = true;

    // file = lib.shows[$state.params.name].seasons[$state.params.season][$state.params.episode].sources[$state.params.index];
    socketIo.emit("torrent:stream", {url: $state.params.magnetUri, target: player.addresses[0]});

    socketIo.on("chromecast:status", function (result) {
      if (result.media) {
        $scope.duration = result.media.duration;

      }

      if (!startTime) {
        startTime = moment();
      }

      if (result.currentTime) {
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
    chromecast.seek(time);
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

  $interval(function incrementTime() {
    if (startTime) {
      $scope.currentTime = moment().diff(startTime, 'seconds');
    }
  }, 1000);

  document.getElementById('player').addEventListener('canplay', function (data) {
    $scope.canPlay = true;
    $scope.$apply();
  })

});
