angular.module('www').controller('HomeCtrl', function ($scope, $http, $rootScope, $state, $timeout, library) {



  $rootScope.current = null;

  $rootScope.$on("libraryUpdated", updateLibrary)

  function updateLibrary(){
    console.log("updateLibrary");
      $scope.shows = [];
      var showKeys = Object.keys($rootScope.library.shows);
      for (var i = 0; i < showKeys.length; i++) {
        var show = $rootScope.library.shows[showKeys[i]];
        show.name = showKeys[i];
        $scope.shows.push(show);
      }
      console.log($scope.shows);
  }

  updateLibrary();


  $scope.viewShow = function (show, data) {
    $rootScope.current = {
      name: show,
      data: data
    };
    $state.go('menu.viewShow');
  };

});
