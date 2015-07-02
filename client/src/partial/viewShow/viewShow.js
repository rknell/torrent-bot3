angular.module('www').controller('ViewshowCtrl', function ($scope, $rootScope, $state) {

    $scope.season = null;
    $scope.episode = null;
    $scope.show = $rootScope.current;
    console.log($scope.show);
    //
    //$scope.view = function(showName, seasonData){
    //    $rootScope.current = {
    //        name: showName,
    //        seasonData: seasonData
    //    }
    //    $state.go('viewEpisodes');
    //};

    $scope.setSeason = function (value) {
        console.log("clicked", value);
        $scope.season = value;
    }
    $scope.setEpisode = function (value) {
        console.log("clicked", value);
        $scope.episode = value;
    }

    $scope.viewEpisode = function (source) {
        $rootScope.currentView = source;
        $state.go('view');
    }

    $scope.go = $state.go;

});
