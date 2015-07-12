angular.module('www').factory('socketIo', function ($rootScope, $http) {
  var socket;

  //function register() {
  //  if (typeof(io) !== "undefined") {
      console.log("Connecting to socketIo");
      socket = io.connect($rootScope.rootPath);
      socket.on('welcome', function (data) {
        console.log(data, socket);
        //cleanRecent(data.library);
        //$rootScope.library = data.library;
        //$rootScope.$broadcast("libraryUpdated", $rootScope.library);
        //$rootScope.$apply();
      });

      //socket.on('added:show', function (data) {
      //  console.log("Added show", data);
      //  library().then(function (library) {
      //    library.shows[data.name] = data.data;
      //  });
      //  $rootScope.$apply();
      //  $rootScope.$broadcast("libraryUpdated");
      //})
      //
      //socket.on('added:recentEpisode', function (data) {
      //  console.log("Found new recent episode", data);
      //  library().then(function (library) {
      //    library.recentEpisodes.push(data);
      //  });
      //  $rootScope.$apply();
      //  $rootScope.$broadcast("libraryUpdated");
      //})

    //} else {
    //  console.error("Socket.IO failed to load");
    //}
  //}

  function emit(type, data) {
    socket.emit(type, data);
    console.log("emitting", type, data);
  }

  function on(event, cb){
      socket.on(event, cb);
  }

  var socketIo = {
    emit: emit,
    on: on
  };

  return socketIo;
});