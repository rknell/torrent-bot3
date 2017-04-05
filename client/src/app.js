angular.module('www', ['ui.router', 'ngAnimate', 'ngMaterial', 'snappyappsLayout']);

angular.module('www').config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider.state('menu.allShows', {
    url: '/allShows',
    templateUrl: 'partial/allShows/home.html'
  });
  $stateProvider.state('menu', {
    url: '/menu',
    templateUrl: 'partial/menu/menu.html',
    abstract: true
  });
  $stateProvider.state('menu.view', {
    url: '/view/:name/:season/:episode/:magnetUri',
    templateUrl: 'partial/view/view.html'
  });
  $stateProvider.state('menu.viewShow', {
    url: '/viewShow/:name',
    templateUrl: 'partial/viewShow/viewShow.html'
  });
  $stateProvider.state('menu.viewSeason', {
    url: '/viewShow/:name/:season',
    templateUrl: 'partial/viewShow/viewShow.html'
  });
  $stateProvider.state('menu.viewEpisode', {
    url: '/viewEpisodes/:name/:season/:episode',
    templateUrl: 'partial/viewShow/viewShow.html'
  });
  $stateProvider.state('menu.recent', {
    url: '/recent',
    templateUrl: 'partial/recent/recent.html'
  });
  /* Add New States Above */
  $urlRouterProvider.otherwise('/menu/recent');

});

angular.module('www').run(function ($rootScope, $state, $window, library, socketIo, chromecast) {

  $rootScope.safeApply = function (fn) {
    var phase = $rootScope.$$phase;
    if (phase === '$apply' || phase === '$digest') {
      if (fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  $state.back = function () {
    $window.history.back();
  };

  $rootScope.$state = $state;

  $rootScope.$on('stateChangeSuccess', function (newState, oldState) {
    console.log("state changed", newState, oldState);
    lastScroll();
  });

  $(window).scroll(function () {
    if (!$rootScope.scrollHandler) {
      $rootScope.scrollHandler = {};
    }
    $rootScope.scrollHandler[$state.current.name] = window.scrollY;
  })

  function lastScroll() {
    if ($rootScope.scrollHandler) {
      $timeout(function () {
        window.scroll(0, $rootScope.scrollHandler[$state.current.name]);
      }, 10);
    }
  }

});
