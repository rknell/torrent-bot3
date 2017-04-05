angular.module('www').controller('ViewshowCtrl', function ($scope, $rootScope, $state, library, $http) {

  $http.get('/show/' + $state.params.name)
    .then(function (res) {
      $scope.show = res.data;
      $rootScope.backgroundUrl = $scope.show.tmdbData.backdrop_path;

      console.log("Current Show", $scope.show);

      if ($state.params.season) {
        $scope.show.seasons.forEach(function (season) {
          if (season.number == $state.params.season) {
            $scope.season = season;
          }
        });
      }

      if ($state.params.episode && $scope.season) {
        $scope.season.episodes.forEach(function (episode) {
          if (episode.number == $state.params.episode) {
            $scope.episode = episode;
          }
        });
      }

      console.log($scope.show, $scope.season, $scope.episode);

    });

  $scope.viewEpisode = function (source) {
    $state.go('menu.view', {
      name: $state.params.name,
      season: $state.params.season,
      episode: $state.params.episode,
      magnetUri: source.magnetUri
    });
  };

});
