'use strict';
angular.module('www').factory('library', function ($http, $q, $rootScope, $timeout, socketIo) {

  socketIo.on('welcome', function (data) {
    cleanRecent(data.library);
    $rootScope.library = data.library;
    $rootScope.$broadcast("libraryUpdated", $rootScope.library);
    $rootScope.$apply();
  });

  socketIo.on('added:show', function (data) {
    console.log("Added show", data);
    $rootScope.library.shows[data.name] = data.data;
    $rootScope.$apply();
    $rootScope.$broadcast("libraryUpdated");
  });

  socketIo.on('added:recentEpisode', function (data) {
    console.log("Found new recent episode", data);
    if(data.airDate){
      $rootScope.library.recentEpisodes.push(data);
      $rootScope.$apply();
      $rootScope.$broadcast("libraryUpdated");
    }
  });

  function cleanRecent(library) {
    var output = [];
    library.recentEpisodes.forEach(function (episode, index) {
      if (episode.airDate) {
        output.push(episode);
      }
    });

    library.recentEpisodes = output;
  }

  return {}

});