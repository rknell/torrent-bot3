angular.module('www').controller('MenuCtrl', function ($scope, chromecast) {

  $scope.chromecasts = chromecast.chromecasts;

});