angular.module('www').controller('HomeCtrl', function ($scope, $http, $rootScope, $state, $timeout) {

    $rootScope.current = null;

    if (!$rootScope.library) {
        $http.get('/library')
            .success(function (result) {
                console.log("got shows", result);
                $scope.shows = result.shows;
                $rootScope.library = result;
                lastScroll();
            });
    } else {
        $scope.shows = $rootScope.library.shows;
        lastScroll();
    }

    function lastScroll() {
        if ($rootScope.scrollHandler) {
            $timeout(function () {
                window.scroll(0, $rootScope.scrollHandler[$state.current.name]);
            }, 10);
        }

    }


    //$scope.view = function(show){
    //    $rootScope.current = show;
    //    $state.go('view');
    //}

    $scope.viewShow = function (show, data) {
        $rootScope.current = {
            name: show,
            data: data
        };
        $state.go('viewShow');
    };


    $(window).scroll(function () {

        if (!$rootScope.scrollHandler) {
            $rootScope.scrollHandler = {}
        }
        $rootScope.scrollHandler[$state.current.name] = window.scrollY;
    })


});
