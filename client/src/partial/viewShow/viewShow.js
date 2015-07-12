angular.module('www').controller('ViewshowCtrl', function ($scope, $rootScope, $state, library) {

    $scope.show = $rootScope.library.shows[$state.params.name];
    $rootScope.current = $scope.show;
    console.log($scope.current, "current");
    if ($state.params.season) {
      $scope.season = $scope.show.seasons[$state.params.season];
    }
    if ($state.params.episode) {
      $scope.episode = $scope.season[$state.params.episode];
    }
    console.log($scope.show, $scope.season, $scope.episode);

  $scope.viewEpisode = function (index) {
    $state.go('menu.view', {
      name: $state.params.name,
      season: $state.params.season,
      episode: $state.params.episode,
      index: index
    });
  };

});
