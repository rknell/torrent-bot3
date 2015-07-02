angular.module('www', ['ui.bootstrap','ui.utils','ui.router','ngAnimate']);

angular.module('www').config(function($stateProvider, $urlRouterProvider) {

    $stateProvider.state('home', {
        url: '/home',
        templateUrl: 'partial/home/home.html'
    });
    $stateProvider.state('menu', {
        url: '/menu',
        templateUrl: 'partial/menu/menu.html'
    });
    $stateProvider.state('view', {
        url: '/view',
        templateUrl: 'partial/view/view.html'
    });
    $stateProvider.state('viewShow', {
        url: '/viewShow',
        templateUrl: 'partial/viewShow/viewShow.html'
    });
    $stateProvider.state('viewEpisodes', {
        url: '/viewEpisodes',
        templateUrl: 'partial/viewEpisodes/viewEpisodes.html'
    });
    /* Add New States Above */
    $urlRouterProvider.otherwise('/home');

});

angular.module('www').run(function($rootScope) {

    $rootScope.safeApply = function(fn) {
        var phase = $rootScope.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

});
