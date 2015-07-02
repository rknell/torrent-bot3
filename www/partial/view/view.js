angular.module('www').controller('ViewCtrl',function($scope, $rootScope, $http, $sce){

    console.log($rootScope.currentView);
    $http.post('/play', {url: $rootScope.currentView.magnetUri})
        .success(function(result){
            console.log(result);
            $scope.videoSource = $sce.trustAsResourceUrl(result.videoUrl);
        })

});
