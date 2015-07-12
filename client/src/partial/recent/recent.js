angular.module('www').controller('RecentCtrl', function ($scope, library, $window, $rootScope) {

  //library();

  var pageSize = 200;
  $scope.limit = pageSize;

  $window.onscroll = function (ev) {
    if (($window.innerHeight + $window.scrollY) >= (document.body.scrollHeight - 1000)) {
      // you're at the bottom of the page
      console.log("Bottom of page");
      $scope.limit += pageSize;
      $scope.$apply();
    }
  };

});